import { TLocalisedString } from '../localiser';
import { LOG, LOG_ERROR, LOG_WARN } from '../util/log_util';
import { UIUtil } from '../util/ui_util';
import { HTMLBuilder } from './misc';

export type TMessage = { text: TLocalisedString, type: 'success' | 'info' | 'warning' | 'error' };

export class AppConsole {
    private static _instance: AppConsole;
    public static get Get() {
        return this._instance || (this._instance = new this());
    }

    private _built: boolean;
    private _messages: TMessage[];

    private constructor() {
        this._built = false;
        this._messages = [];
    }

    public build() {
        // Vue Console component will handle this
        this._built = true;
        
        // Add existing messages to Vue console if it exists
        if ((window as any).__vueConsole) {
            this._messages.forEach((message) => {
                (window as any).__vueConsole.addMessage(message);
            });
        }
    }

    public addLast() {
        if (!this._built) {
            return;
        }

        // Use Vue console if available, otherwise fallback to DOM manipulation
        if ((window as any).__vueConsole) {
            const lastMessage = this._messages[this._messages.length - 1];
            (window as any).__vueConsole.addMessage(lastMessage);
        } else {
            // Fallback for cases where Vue console isn't ready yet
            const consoleElement = document.getElementById('inner-console') as HTMLDivElement;
            if (consoleElement) {
                consoleElement.innerHTML += this._getMessageHTML(this._messages[this._messages.length - 1]);
                this._scrollToBottom();
            }
        }
    }

    private _getMessageHTML(message: TMessage) {
        switch (message.type) {
            case 'success':
                return `<div class="row-item text-success">[OKAY]: ${message.text}</div>`;
            case 'info':
                return `<div class="row-item text-info">[INFO]: ${message.text}</div>`;
            case 'warning':
                return `<div class="row-item text-warning">[WARN]: ${message.text}</div>`;
            case 'error':
                return `<div class="row-item text-error">[UHOH]: ${message.text}</div>`;
        }
    }

    public static add(message: TMessage) {
        switch (message.type) {
            case 'error':
                this.error(message.text);
                break;
            case 'warning':
                this.warning(message.text);
                break;
            case 'info':
                this.info(message.text);
                break;
            case 'success':
                this.success(message.text);
                break;
        }
    }

    public static success(message: TLocalisedString) {
        LOG(message);
        this.Get._messages.push({ text: message, type: 'success' });
        this.Get.addLast();
    }

    public static info(message: TLocalisedString) {
        LOG(message);
        this.Get._messages.push({ text: message, type: 'info' });
        this.Get.addLast();
    }

    public static warning(message: TLocalisedString) {
        LOG_WARN(message);
        this.Get._messages.push({ text: message, type: 'warning' });
        this.Get.addLast();
    }

    public static error(message: TLocalisedString) {
        LOG_ERROR(message);
        this.Get._messages.push({ text: message, type: 'error' });
        this.Get.addLast();
    }

    private _scrollToBottom() {
        // Vue console handles its own scrolling
        if (!(window as any).__vueConsole) {
            const consoleElement = document.getElementById('inner-console');
            if (consoleElement) {
                consoleElement.scrollTop = consoleElement.scrollHeight;
            }
        }
    }
}
