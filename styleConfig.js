var subtitlesStyleConfig = {
    id: 'ssatv-subtitles',
    defaultStyle: [
        { selector: '.video-container', print: false }, // container
        { selector: '.video-container > video#apple-music-video-player', print: false }, // player
        { selector: '.video-container > div:last-of-type', print: false }, // wrapper
        {
            id: 'position',
            selector: '.video-container > div:last-of-type > div',
            print: true,
            declarations: {
                'transform': 'translateY(-1.5em)',
            }
        },
        {
            id: 'position.top',
            selector: '#video-container > div:last-of-type > div.top',
            print: true,
            declarations: {
                'transform': 'translateY(1.5em)',
                'top': '0px',
            }
        },
        {
            id: 'shadow',
            selector: '.video-container > div:last-of-type > div > div',
            print: true,
            declarations: {
                'background': 'none'
            }
        },
        {
            id: 'text',
            selector: '.video-container > div:last-of-type > div > div > div',
            print: true,
            declarations: {
                'font-size': '64px',
                'line-height': '1.2',
                'color': 'rgb(255, 255, 255)',
            }
        },

        /* text-contrast set */
            { // outline
                id: 'text-contrast::outline',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: true,
                declarations: {
                    'text-shadow': '0px 0px 10px #000, -2px -2px 1px #000, 2px -2px 1px #000, -2px  2px 1px #000, 2px  2px 1px #000',
                }
            },
            { // opaque-background
                id: 'text-contrast::opaque-background',
                selector: '.video-container > div:last-of-type > div > div',
                print: false,
                declarations: {
                    'background-color': 'rgba(0, 0, 0, 1)',
                }
            },
            { // see-through-background
                id: 'text-contrast::see-through-background',
                selector: '.video-container > div:last-of-type > div > div',
                print: false,
                declarations: {
                    'background-color': 'rgba(0, 0, 0, 0.5)',
                }
            },
            { // none
                id: 'text-contrast::none',
                selector: '.video-container > div:last-of-type > div > div',
                print: false,
                declarations: {
                    'background': 'none'
                }
            },

        /* font-family set */
            { // Arial
                id: 'font-family::arial',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: true,
                declarations: {
                    'font-family': 'Arial, Helvetica, sans-serif',
                }
            },
            { // Tahoma
                id: 'font-family::tahoma',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': 'Tahoma, Geneva, sans-serif',
                }
            },
            { // Comic Sans
                id: 'font-family::comic-sans',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': '"Comic Sans MS", cursive, sans-serif',
                }
            },
            { // Lucida Sans
                id: 'font-family::lucida-sans',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                }
            },
            { // Trebuchet
                id: 'font-family::trebuchet',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': '"Trebuchet MS", Helvetica, sans-serif',
                }
            },
            { // Verdana
                id: 'font-family::verdana',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': 'Verdana, Geneva, sans-serif',
                }
            },
            { // Georgia
                id: 'font-family::georgia',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-family': 'Georgia, serif',
                }
            },

        /* font-weight set */
            { // Normal
                id: 'font-weight::normal',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: true,
                declarations: {
                    'font-weight': 'normal',
                }
            },
            { // Bold
                id: 'font-weight::normal',
                selector: '.video-container > div:last-of-type > div > div > div',
                print: false,
                declarations: {
                    'font-weight': 'bold',
                }
            },

    ],
    userStyle: {
        'fontSize': null,
        'fontColor': null,
        'fontWeight': null,
        'fontfamily': null,
        'textContrast': null,
    }
};

var buttonsStyleConfig = {
    id: 'ssatv-buttons',
    defaultStyle: [
        { selector: 'amp-video-player', print: false },
        { selector: 'amp-video-player > div.footer__row + div.footer__row', print: false },
        { selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child', print: false },
        {
            id: 'wrapper',
            selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child > .subtitles-size-control',
            print: true,
            declarations: {
                'width': '30px',
            }
        },
        {
            id: 'button',
            selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child > .subtitles-size-control > span',
            print: true,
            declarations: {
                'cursor': 'pointer',
                'transition': 'opacity 0.15s ease 0s',
            }
        },
        {
            id: 'button-hover',
            selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child > .subtitles-size-control > span:hover',
            print: true,
            declarations: {
                'opacity': '0.8',
            }
        },
        {
            id: 'bigger-button',
            selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child > .subtitles-size-control > .bigger-subtitles',
            print: true,
            declarations: {
                'margin-left': '8px',
                'float':       'right',
                'font-size':   '16px',
                'line-height': '24px',
            }
        },
        {
            id: 'smaller-button',
            selector: 'amp-video-player > div.footer__row + div.footer__row > .footer__column:last-child > .subtitles-size-control > .smaller-subtitles',
            print: true,
            declarations: {
                'float':       'left',
                'font-size':   '12px',
                'line-height': '26px',
            }
        },
    ],
};