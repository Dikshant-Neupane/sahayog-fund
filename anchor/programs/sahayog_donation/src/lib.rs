use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;


declare_id!("Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA");

#[program]
pub mod sahayog_donation {
    use super::*;

    pub fn donate(ctx: Context<Donate>, amount: u64, message: String) -> Result<()> {
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
        msg!("Donation received: {} lamports - Message: {}", amount, message);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    /// CHECK: This is the fund wallet receiving donations
    #[account(mut)]
    pub fund_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
