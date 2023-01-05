// Declare this file as a StarkNet contract and set the required
// builtins.
%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_nn, assert_lt
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.syscalls import get_block_timestamp

// Define a storage variable.
@storage_var
func owner() -> (res: felt) {
}

@storage_var
func deadline() -> (res: felt) {
}

@storage_var
func goal() -> (res: felt) {
}

@storage_var
func end_of_campaign() -> (res: felt) {
}

@storage_var
func current_pledge() -> (res: felt) {
}

@storage_var
func account_balance(account_id: felt) -> (balance: felt) {
}

@storage_var
func pledge_balance(account_id: felt) -> (balance: felt) {
}

// Contract constructor.
@constructor
func constructor{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}(
    initial_number_of_days: felt, initial_goal: felt, initial_account_id: felt
) {
    assert_lt(0, initial_number_of_days);
    assert_lt(0, initial_goal);

    let (block_timestamp) = get_block_timestamp();
    deadline.write(block_timestamp + (initial_number_of_days* 24 * 60 * 60));
    goal.write(initial_goal);
    owner.write(initial_account_id);
    end_of_campaign.write(0);

    return ();
}

// Return data.
@view
func get_owner{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}() -> (res: felt) {
    let (res) = owner.read();
    return (res,);
}

@view
func get_deadline{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}() -> (res: felt) {
    let (res) = deadline.read();
    return (res,);
}

@view
func get_goal{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}() -> (res: felt) {
    let (res) = goal.read();
    return (res,);
}

@view
func get_end_of_campaign{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}() -> (res: felt) {
    let (res) = end_of_campaign.read();
    return (res,);
}

@view
func get_current_pledge{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}() -> (res: felt) {
    let (res) = current_pledge.read();
    return (res,);
}

@view
func get_account_balance{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}(account_id: felt) -> (res: felt) {
    let (res) = account_balance.read(account_id=account_id);
    return (res=res);
}

@view
func get_pledge_balance{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}(account_id: felt) -> (res: felt) {
    let (res) = pledge_balance.read(account_id=account_id);
    return (res=res);
}

// Pledge campaign.
@external
func account_balance_increase{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}(
    amount: felt,
    account_id: felt,
) {
    // Verify that the amount is positive.
    with_attr error_message(
            "Amount must be positive. Got: {amount}.") {
        assert_nn(amount);
    }

    let (caller_id) = get_caller_address();
    let (contract_owner) = owner.read();
    with_attr error_message(
            "Can be called only by owner.") {
        assert contract_owner = caller_id;
    }

    // Update account balance.
    let (res) = account_balance.read(account_id=account_id);
    account_balance.write(account_id, res + amount);
    return ();
}

// Pledge campaign.
@external
func pledge{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}(
    amount: felt
) {
    // Verify that the amount is positive.
    with_attr error_message(
            "Amount must be positive. Got: {amount}.") {
        assert_nn(amount);
    }

    // Verify that the deadline is greater than block_timestamp.
    with_attr error_message(
            "Deadline must be greater than block_timestamp.") {
        let (block_timestamp) = get_block_timestamp();
        let (assert_deadline) = deadline.read();
        assert_lt(block_timestamp, assert_deadline);
    }

    // Verify that amount is greater than account_balance.
    let (account_id) = get_caller_address();
    let (balance) = account_balance.read(account_id=account_id);
    with_attr error_message(
            "Deadline must be greater than block_timestamp.") {
        assert_lt(amount, balance);
    }

    // Update balances.
    let (current_pledge_balance) = pledge_balance.read(account_id=account_id);
    pledge_balance.write(account_id, current_pledge_balance + amount);
    current_pledge.write(current_pledge_balance + amount);
    account_balance.write(account_id, balance - amount);
    return ();
}

// Claim funds as owner.
@external
func claim_funds{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}() {
    let (end_of_campaign_status) = end_of_campaign.read();
    assert end_of_campaign_status = 0;
    
    let (caller_id) = get_caller_address();
    let (contract_owner) = owner.read();
    with_attr error_message(
            "Can be called only by owner.") {
        assert contract_owner = caller_id;
    }

    let (current_pledge_balance) = current_pledge.read();
    let (pledge_goal) = goal.read();
    assert_lt(pledge_goal, current_pledge_balance);

    // TODO: fix time issue on devnet level
    // let (deadline_timestamp) = deadline.read();
    // let (block_timestamp) = get_block_timestamp();
    // assert_lt(deadline_timestamp, block_timestamp);

    // Update balances.
    let (balance) = account_balance.read(account_id=contract_owner);
    account_balance.write(contract_owner, balance + current_pledge_balance);

    // Finish end_of_campaign.
    end_of_campaign.write(1);

    return ();
}

// Get full refund.
@external
func get_full_refund{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}() {
    let (end_of_campaign_status) = end_of_campaign.read();
    assert end_of_campaign_status = 0;

    // TODO: fix time issue on devnet level
    // let (deadline_timestamp) = deadline.read();
    // let (block_timestamp) = get_block_timestamp();
    // assert_lt(deadline_timestamp, block_timestamp);

    let (current_pledge_balance) = current_pledge.read();
    let (pledge_goal) = goal.read();
    assert_lt(current_pledge_balance, pledge_goal);

    // Update balances.
    let (account_id) = get_caller_address();
    let (account_pledge_balance) = pledge_balance.read(account_id=account_id);
    let (user_account_balance) = account_balance.read(account_id=account_id);
    pledge_balance.write(account_id, 0);
    account_balance.write(account_id, user_account_balance + account_pledge_balance);

    return ();
}