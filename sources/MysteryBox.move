module deployer_address::MysteryBoxv1 {

    use std::string;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::randomness;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::object::{Self, Object, ExtendRef, DeleteRef};
    use aptos_framework::aptos_account;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct MysteryBox has key {
        coins: Coin<AptosCoin>,
        extend_ref: ExtendRef,
        delete_ref: DeleteRef
    }

    const ENOT_OWNER: u64 = 2001;
    const ENOT_ENOUGH_COINS: u64 = 2002;

    #[randomness]
    public(friend) entry fun create_and_airdrop(caller: &signer, receiver: address){
        let caller_addr = signer::address_of(caller);
        let constructor_ref = object::create_object(receiver);
        let object_signer = object::generate_signer(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let delete_ref = object::generate_delete_ref(&constructor_ref);

        let random_coin_value = randomness::u64_range(0, 100);
        assert!(coin::balance<AptosCoin>(caller_addr) >= random_coin_value, ENOT_ENOUGH_COINS);

        let coins = coin::withdraw(caller, random_coin_value);

        move_to(&object_signer, MysteryBox{
            coins,
            extend_ref,
            delete_ref
        });
    }

    public entry fun open_box(receiver: &signer, obj_addr: address) acquires MysteryBox {
        let receiver_addr = signer::address_of(receiver);
        let mystery_box = object::address_to_object<MysteryBox>(obj_addr);

        assert!(object::is_owner<MysteryBox>(mystery_box, receiver_addr), ENOT_OWNER);
        let MysteryBox {coins, extend_ref: _, delete_ref} = move_from<MysteryBox>(obj_addr);
        aptos_account::deposit_coins(receiver_addr, coins);
        object::delete(delete_ref);
    }
    

}