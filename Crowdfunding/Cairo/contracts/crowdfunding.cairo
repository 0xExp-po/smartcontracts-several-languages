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
    initial_number_of_days: felt, initial_goal: felt
) {
    assert_lt(0, initial_number_of_days);
    assert_lt(0, initial_goal);

    let (block_timestamp) = get_block_timestamp();
    deadline.write(block_timestamp + (initial_number_of_days* 24 * 60 * 60));
    goal.write(initial_goal);

    let (account_id) = get_caller_address();
    owner.write(account_id);

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

    // Verify that the caller is owner is positive.
    let (account_id) = get_caller_address();
    let (contract_owner) = owner.read();
    with_attr error_message(
            "Can be called only by owner.") {
        assert contract_owner = account_id;
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

    // Verify that tamount is greater than account_balance.
    let (account_id) = get_caller_address();
    let (balance) = account_balance.read(account_id=account_id);
    with_attr error_message(
            "Deadline must be greater than block_timestamp.") {
        assert_lt(amount, balance);
    }

    // Update balances.
    let (current_pledge_balance) = pledge_balance.read(account_id=account_id);
    pledge_balance.write(account_id, current_pledge_balance + amount);
    account_balance.write(account_id, balance - amount);
    return ();
}

//     function claimFunds() public {
//         require(address(this).balance >= goal);
//         require(block.timestamp >= deadline);
//         require(msg.sender == owner);

//         payable(msg.sender).transfer(address(this).balance);
//     }

//     function getRefund() public {
//         require(address(this).balance < goal);
//         require(block.timestamp >= deadline);

//         uint256 amount = pledgeOf[msg.sender];
//         pledgeOf[msg.sender] = 0;
//         payable(msg.sender).transfer(amount);
//     }
