const minimizedClass = "dk_minimized";
const debug = true;

function log (...messages) {
        if (!debug) return;

        for (const message of messages) {
            console.log(message);
        }
}

class TwitchChatFilter {
    /**
     * format: messages per minute: ['option1', 'option2', ..]
     * options:
     * 'split': move filtered messages into a separate chat (otherwise, minimize them)
     * 'caps': filter messages in full caps
     * 'spam': filter messages that are repeated
     * 'emote': filter messages that are emote only
     * 'commands': filter messages that are !commands
     * 'length1' : filter messages that are 1 word or less
     * 'length2' : filter messages that are 2 word or less
     * 'length3' : filter messages that are 3 word or less
     */

    filters = {
        30: ['commands'],
        60: ['split', 'commands', 'length1', 'emote', 'spam'],
        90: ['split', 'commands', 'length2', 'emote', 'spam', 'caps']
    }
    activeFilters = [];
    minimize = true;

    filter(messageElement) {
        const message = this.getMessage(messageElement);
        
        if (!message || message.isVIP) {
            return false;
        }
        log(message);

        if (this.activeFilters.length == 0) {
            this.activeFilters = this.getActiveFilters();
        }

        for (const filter of this.activeFilters) {
            switch (filter) {
                case 'split':
                    this.minimize = false;
                    break;
                case 'emote':
                    if (this.isEmote(message)) return true;
                    break;
                case 'commands':
                    if (this.isCommands(message)) return true;
                    break;
                case 'caps':
                    if (this.isCaps(message)) return true;
                    break;
                case 'length1':
                    if (this.isLength1(message)) return true;
                    break;
                case 'length2':
                    if (this.isLength2(message)) return true;
                    break;
                case 'length3':
                    if (this.isLength3(message)) return true;
                    break;
                case 'spam':
                    if (this.isSpam(message)) return true;
                    break;
            }
        }

        return false;
    }

    isCaps(message) {
        return message.string == message.string.toUpperCase();
    }

    isEmote(message) {
        return message.string.length == 0;
    }

    isCommands(message) {
        return message.string[0] === "!";
    }

    isLength1(message) {
        return message.string.split(' ').length <= 1;
    }

    isLength2(message) {
        return message.string.split(' ').length <= 2;
    }

    isLength3(message) {
        return message.string.split(' ').length <= 3;
    }

    isSpam(message) {
        return this.previousMessages[message.collapsed] >= 3;
    }

    getMessage(messageElement) {
        const message = {};

        const msgUsername = messageElement.querySelector('*[class*="chat-line__username"]');
        const msgBadges = messageElement.querySelector('.chat-line__message--badges');
        const VIPstring = msgBadges ? msgBadges.innerHtml.toLowerCase() : msgUsername.innerHtml.replace(msgUsername.textContent, '').toLowerCase();
        const VIPwords = ['broadcast', 'mod', 'vip', 'diff'];

        message.timestamp = messageElement.querySelector('.chat-line__timestamp').textContent;
        message.string = messageElement.querySelector('.text-fragment').parentElement.textContent.trim();
        message.collapsed = message.string.replace(/(.)\1+/g, '$1');
        message.username = msgUsername.textContent;
        message.isVIP = VIPwords.filter(word => VIPstring.includes(word)).length > 0;
        message.element = messageElement;

        this.storeMessage(message);

        return message;
    }

    storeMessage(message) {
        const time = Date.now();
        
    }
}

class ChatManager {
    chatElementClass = "chat-scrollable-area";
    chatElement;
    Observer;
    TwitchChatFilter = new TwitchChatFilter;
    
    getChatElement() {
        this.chatElement = document.querySelector(`div[class*="${this.chatClass}"]`);
        return this.chatElement;
    }

    observerCallback(mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.addedNodes.length > 0) {
                log("A node has been added or removed.", mutation.addedNodes);

                const message = mutation.addedNodes[0];

                if (this.TwitchChatFilter.filter(message)) {
                    if (this.TwitchChatFilter.minimize) {
                        message.classList.add(minimizedClass);
                    } else {
                        this.TwitchChatFilter.extraChat.append(message);
                    }
                }
            }
        }
    }

    enable() {
        const options = { childList: true };
        this.Observer = new MutationObserver(this.observerCallback);
        this.Observer.observe(this.getChatElement(), options)
    }

    disable() {
        if (this.Observer instanceof MutationObserver) {
            this.Observer.disconnect();
        }
    }
}