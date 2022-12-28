// Declare this file as a StarkNet contract and set the required
// builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.alloc import alloc
from util import almost_equal as aeq

// Define a storage variable.
@storage_var
func number_of_days() -> (res: felt) {
}

@storage_var
func goal() -> (res: felt) {
}

// Contract constructor.
@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    initial_number_of_days: felt, initial_goal: felt
) {
    number_of_days.write(initial_number_of_days);
    goal.write(initial_goal);
    return ();
}

// Returns the current data.
@view
func get_number_of_days{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (res: felt) {
    let (res) = number_of_days.read();
    return (res,);
}

@view
func get_goal{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (res: felt) {
    let (res) = goal.read();
    return (res,);
}