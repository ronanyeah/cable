module cable::cable {

    use sui::event;
    use std::string::String;

    const ENotAuthorized: u64 = 1001;

    public struct Chat has key {
        id: UID,
        creator: address,
        creator_pubkey: Option<String>,
        invitee: address,
        invitee_pubkey: Option<String>,
        last_message: address,
        messages: u16,
    }

    public struct ChatLink has key {
        id: UID,
        chat: ID,
    }

    public struct NewChat has copy, drop {
        chat: ID,
    }

    public struct NewMsg has copy, drop {
        chat: ID,
        msg: address
    }

    fun init(_ctx: &mut TxContext) {
        //
    }

    public fun create_chat(invitee: address, ctx: &mut TxContext) {
        if (ctx.sender() == invitee) {
            abort ENotAuthorized
        };

        let chat_id = object::new(ctx);

        transfer::transfer(ChatLink {
            id: object::new(ctx),
            chat: chat_id.to_inner()
        }, ctx.sender());
        transfer::transfer(ChatLink {
            id: object::new(ctx),
            chat: chat_id.to_inner()
        }, invitee);

        event::emit(NewChat { chat: chat_id.to_inner() });

        let chat = Chat {
            id: chat_id,
            creator_pubkey: option::none(),
            creator: ctx.sender(),
            invitee,
            invitee_pubkey: option::none(),
            last_message: @0x0,
            messages: 0,
        };

        transfer::share_object(chat);
    }

    public fun set_pubkey(chat: &mut Chat, pubkey: String, ctx: &mut TxContext) {
        if (ctx.sender() == chat.invitee) {
            chat.invitee_pubkey = option::some(pubkey);
        } else if (ctx.sender() == chat.creator) {
            chat.creator_pubkey = option::some(pubkey);
        } else {
            abort ENotAuthorized
        }
    }

    public fun register_message(chat: &mut Chat, msg: address, ctx: &mut TxContext) {
        assert!(ctx.sender() == chat.creator || ctx.sender() == chat.invitee, ENotAuthorized);
        chat.last_message = msg;
        chat.messages = chat.messages + 1;
        event::emit(NewMsg { chat: chat.id.to_inner(), msg });
    }

    public fun destroy_chat(self: Chat, ctx: &mut TxContext) {
        assert!(ctx.sender() == self.creator || ctx.sender() == self.invitee, ENotAuthorized);
        let Chat {
            id,
            creator: _,
            creator_pubkey: _,
            invitee: _,
            invitee_pubkey: _,
            last_message: _,
            messages: _,
        } = self;
        object::delete(id);
    }

    public fun destroy_chat_link(self: ChatLink) {
        let ChatLink {
            id,
            chat: _,
        } = self;
        object::delete(id);
    }
}
