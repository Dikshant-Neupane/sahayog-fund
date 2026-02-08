use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

declare_id!("Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA");

// ===== Constants =====
const MIN_DONATION_LAMPORTS: u64 = 100_000;        // 0.0001 SOL
const MAX_DONATION_LAMPORTS: u64 = 500_000_000_000; // 500 SOL (whale protection)
const MAX_CAMPAIGN_DURATION: i64 = 180 * 24 * 60 * 60; // 180 days in seconds
const MAX_MESSAGE_LENGTH: usize = 280;

#[program]
pub mod sahayog_donation {
    use super::*;

    /// Initialize a campaign with a fund wallet and deadline
    pub fn initialize(
        ctx: Context<Initialize>,
        fund_wallet: Pubkey,
        deadline: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;

        // Validate deadline is in the future
        require!(deadline > now, SahayogError::DeadlineInPast);

        // Enforce maximum campaign duration (180 days)
        require!(
            deadline <= now + MAX_CAMPAIGN_DURATION,
            SahayogError::CampaignTooLong
        );

        let state = &mut ctx.accounts.donation_state;
        state.authority = ctx.accounts.authority.key();
        state.fund_wallet = fund_wallet;
        state.total_donated = 0;
        state.donor_count = 0;
        state.is_active = true;
        state.deadline = deadline;
        state.total_withdrawn = 0;
        state.bump = ctx.bumps.donation_state;

        msg!(
            "Campaign initialized by {} | Wallet: {} | Deadline: {}",
            state.authority,
            state.fund_wallet,
            state.deadline
        );
        Ok(())
    }

    /// Donate SOL to the campaign fund wallet
    pub fn donate(ctx: Context<Donate>, amount: u64, message: String) -> Result<()> {
        let state = &mut ctx.accounts.donation_state;
        let clock = Clock::get()?;

        // Validate campaign is active
        require!(state.is_active, SahayogError::CampaignInactive);

        // Validate campaign has not expired
        require!(
            clock.unix_timestamp < state.deadline,
            SahayogError::CampaignExpired
        );

        // Validate donation amount bounds
        require!(
            amount >= MIN_DONATION_LAMPORTS,
            SahayogError::DonationTooSmall
        );
        require!(
            amount <= MAX_DONATION_LAMPORTS,
            SahayogError::DonationTooLarge
        );

        // Validate message length
        require!(
            message.len() <= MAX_MESSAGE_LENGTH,
            SahayogError::MessageTooLong
        );

        // Transfer SOL from donor to fund wallet
        let ix = system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &ctx.accounts.fund_wallet.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.fund_wallet.to_account_info(),
            ],
        )?;

        // Update state
        state.total_donated = state.total_donated.checked_add(amount).unwrap();
        state.donor_count = state.donor_count.checked_add(1).unwrap();

        msg!(
            "Donation: {} lamports from {} | Message: {} | Total: {}",
            amount,
            ctx.accounts.donor.key(),
            message,
            state.total_donated
        );
        Ok(())
    }

    /// Withdraw funds — only the campaign authority can call this
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let state = &mut ctx.accounts.donation_state;
        let clock = Clock::get()?;

        // CRITICAL: Validate the signer is the campaign authority
        require!(
            ctx.accounts.authority.key() == state.authority,
            SahayogError::Unauthorized
        );

        // Enforce withdrawal only after deadline
        require!(
            clock.unix_timestamp >= state.deadline,
            SahayogError::WithdrawalBeforeDeadline
        );

        // Validate withdrawal amount
        let available = state.total_donated.saturating_sub(state.total_withdrawn);
        require!(amount <= available, SahayogError::InsufficientFunds);
        require!(amount > 0, SahayogError::ZeroAmount);

        // Transfer SOL from fund wallet to authority
        let ix = system_instruction::transfer(
            &ctx.accounts.fund_wallet.key(),
            &ctx.accounts.authority.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.fund_wallet.to_account_info(),
                ctx.accounts.authority.to_account_info(),
            ],
        )?;

        state.total_withdrawn = state.total_withdrawn.checked_add(amount).unwrap();

        msg!(
            "Withdrawal: {} lamports by {} | Remaining: {}",
            amount,
            ctx.accounts.authority.key(),
            state.total_donated.saturating_sub(state.total_withdrawn)
        );
        Ok(())
    }

    /// Refund a donor if the campaign failed or was flagged as a scam
    /// Only the campaign authority can initiate refunds
    pub fn refund(ctx: Context<Refund>, amount: u64) -> Result<()> {
        let state = &mut ctx.accounts.donation_state;

        // Only authority can issue refunds
        require!(
            ctx.accounts.authority.key() == state.authority,
            SahayogError::Unauthorized
        );

        // Validate refund amount
        let available = state.total_donated.saturating_sub(state.total_withdrawn);
        require!(amount <= available, SahayogError::InsufficientFunds);
        require!(amount > 0, SahayogError::ZeroAmount);

        // Transfer SOL from fund wallet back to donor
        let ix = system_instruction::transfer(
            &ctx.accounts.fund_wallet.key(),
            &ctx.accounts.donor.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.fund_wallet.to_account_info(),
                ctx.accounts.donor.to_account_info(),
            ],
        )?;

        state.total_withdrawn = state.total_withdrawn.checked_add(amount).unwrap();

        msg!(
            "Refund: {} lamports to {} | Authorized by {}",
            amount,
            ctx.accounts.donor.key(),
            ctx.accounts.authority.key()
        );
        Ok(())
    }

    /// Pause or unpause the campaign (emergency stop)
    pub fn toggle_active(ctx: Context<ToggleActive>) -> Result<()> {
        let state = &mut ctx.accounts.donation_state;

        require!(
            ctx.accounts.authority.key() == state.authority,
            SahayogError::Unauthorized
        );

        state.is_active = !state.is_active;
        msg!("Campaign active status: {}", state.is_active);
        Ok(())
    }
}

// ===== Account Structures =====

#[account]
pub struct DonationState {
    pub authority: Pubkey,       // Campaign creator (32 bytes)
    pub fund_wallet: Pubkey,     // Treasury wallet (32 bytes)
    pub total_donated: u64,      // Total SOL donated in lamports (8 bytes)
    pub total_withdrawn: u64,    // Total SOL withdrawn in lamports (8 bytes)
    pub donor_count: u64,        // Number of donations (8 bytes)
    pub is_active: bool,         // Campaign pause switch (1 byte)
    pub deadline: i64,           // Unix timestamp deadline (8 bytes)
    pub bump: u8,                // PDA bump seed (1 byte)
}

// Space: 8 (discriminator) + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 1 = 106
const DONATION_STATE_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 1;

// ===== Instruction Contexts =====

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = DONATION_STATE_SIZE,
        seeds = [b"donation_state"],
        bump,
    )]
    pub donation_state: Account<'info, DonationState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(
        mut,
        seeds = [b"donation_state"],
        bump = donation_state.bump,
    )]
    pub donation_state: Account<'info, DonationState>,
    #[account(mut)]
    pub donor: Signer<'info>,
    /// CHECK: Validated against donation_state.fund_wallet
    #[account(
        mut,
        constraint = fund_wallet.key() == donation_state.fund_wallet @ SahayogError::InvalidFundWallet
    )]
    pub fund_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"donation_state"],
        bump = donation_state.bump,
    )]
    pub donation_state: Account<'info, DonationState>,
    /// CRITICAL: Must be the campaign authority
    #[account(
        mut,
        constraint = authority.key() == donation_state.authority @ SahayogError::Unauthorized
    )]
    pub authority: Signer<'info>,
    /// CHECK: Validated against donation_state.fund_wallet
    #[account(
        mut,
        constraint = fund_wallet.key() == donation_state.fund_wallet @ SahayogError::InvalidFundWallet
    )]
    pub fund_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(
        mut,
        seeds = [b"donation_state"],
        bump = donation_state.bump,
    )]
    pub donation_state: Account<'info, DonationState>,
    #[account(
        mut,
        constraint = authority.key() == donation_state.authority @ SahayogError::Unauthorized
    )]
    pub authority: Signer<'info>,
    /// CHECK: Validated against donation_state.fund_wallet
    #[account(
        mut,
        constraint = fund_wallet.key() == donation_state.fund_wallet @ SahayogError::InvalidFundWallet
    )]
    pub fund_wallet: AccountInfo<'info>,
    /// CHECK: The donor receiving the refund
    #[account(mut)]
    pub donor: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ToggleActive<'info> {
    #[account(
        mut,
        seeds = [b"donation_state"],
        bump = donation_state.bump,
    )]
    pub donation_state: Account<'info, DonationState>,
    #[account(
        constraint = authority.key() == donation_state.authority @ SahayogError::Unauthorized
    )]
    pub authority: Signer<'info>,
}

// ===== Custom Errors =====

#[error_code]
pub enum SahayogError {
    #[msg("Unauthorized: Only the campaign authority can perform this action")]
    Unauthorized,
    #[msg("Campaign is not active")]
    CampaignInactive,
    #[msg("Campaign has expired")]
    CampaignExpired,
    #[msg("Donation amount is below minimum (0.0001 SOL)")]
    DonationTooSmall,
    #[msg("Donation amount exceeds maximum (500 SOL)")]
    DonationTooLarge,
    #[msg("Message exceeds maximum length (280 characters)")]
    MessageTooLong,
    #[msg("Deadline must be in the future")]
    DeadlineInPast,
    #[msg("Campaign duration exceeds maximum (180 days)")]
    CampaignTooLong,
    #[msg("Withdrawal not allowed before campaign deadline")]
    WithdrawalBeforeDeadline,
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Invalid fund wallet address")]
    InvalidFundWallet,
}
