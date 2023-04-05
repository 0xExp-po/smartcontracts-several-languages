use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("5wGcaLzZp1jztmJXeJecJ1Cr5A6miKruqqcaX5UcVekH");

#[program]
pub mod zkproofstorageapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fact: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.fact_registry.push(fact);
        Ok(())
    }

    pub fn update(ctx: Context<Update>, fact: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.fact_registry.push(fact);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 64 + 64)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub fact_registry: Vec<String>,
}