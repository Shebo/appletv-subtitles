// ==UserScript==
// @name         Styled Subtitles for Apple TV+
// @namespace
// @version      0.1
// @description
// @author       Boaz Shebo Berger
// @match        https://tv.apple.com/*/show/*
// @match        https://tv.apple.com/*/movie/*
// @match        https://tv.apple.com/show/*
// @match        https://tv.apple.com/movie/*
// @match        /https:\/\/tv\.apple\.com\/(.*\/?)(show|movie)\/.*/
// ==/UserScript==

class styleModel {
    constructor(config) {
        this.styleId = config.id;
        this.style   = this.getStyle( config.defaultStyle, config.userStyle );

        // make sure localstorage got some settings
        this.setStyle();
    }

    getStyle( defaultStyle, userStyle ) {
        var style = localStorage.getItem(`style::${this.styleId}`);
        var style = localStorage.getItem(`userStyle::${this.styleId}`);
        return ( style ) ? JSON.parse( style ) : defaultStyle;
    };

    setStyle() {
        localStorage.setItem(`style::${this.styleId}`, JSON.stringify( this.style ) );

        return this;
    };

    updateRule( ruleID, declarations ) {

        var ruleIndex = this.getRuleIndex( ruleID );

        Object.assign(this.style[ ruleIndex ].declarations, declarations);

        return this;
    };

    getRule( ruleID, declarations ) {

        var ruleIndex = this.getRuleIndex( ruleID );

        return this.style[ ruleIndex ].declarations;
    };

    getRuleIndex( ruleID ) {

        return this.style.findIndex(function( rule ){
            return rule.id == ruleID;
        });
    };

    getActiveRuleOfRuleset( rulesetPrefix ) {

        return this.style.find(function( rule ){
            return rule.id && rule.id.startsWith( rulesetPrefix ) && rule.print;
        });
    };

    activateRule( ruleIndex ){
        this.style[ruleIndex].print = true;
    };

    deactivateRule( ruleIndex ){
        this.style[ruleIndex].print = false;
    };

    changeRuleset( ruleID ){
        var [prefix, id] = ruleID.split('::')
        this.toggleOffRuleset( prefix );

        var ruleIndex = this.getRuleIndex( ruleID );
        this.activateRule( ruleIndex );

    };

    toggleOffRuleset( rulesetPrefix ) {

        this.style.forEach(function(rule, index) {
            if( rule.id && rule.id.startsWith( rulesetPrefix ) ){
                this.deactivateRule( index );
            }
        }, this);
    };
}

class styleManager extends styleModel {

    constructor( config ) {
        super( config )
    }

    setTarget( $target ){
        this.$target = $target;

        return this;
    };

    isStyleExist(){
        return this.$target && this.$target.length && this.$target.children(`#${this.styleId}`).length;
    };

    addImportantToCSSRows( css ){
        return css.replace(/;/g, ' !important;');
    };

    createElement(){
        var styleObj = document.createElement('style');
        styleObj.type = 'text/css';
        styleObj.id = this.styleId;
        this.$target[0].appendChild( styleObj );
        this.$style = styleObj;

        return this;
    };

    updateStyle(){

        if( !this.isStyleExist() ) this.createElement();

        this.$style.innerHTML = this.addImportantToCSSRows( CssBuilder( this.style ) );

        return this;
    };
}

var CssBuilder = (function(){

    var getCSSDeclarations = function( declarations ) {
        var rows = [];
        for (var property in declarations) {
            rows.push( `${property}: ${declarations[property]};` );
        }

        return rows.join(``);
    };

    var getCSS = function( style ) {
        var css = ``;
        for (const rule of style) {
            if( rule.print ){
                css += `${rule.selector} {${getCSSDeclarations( rule.declarations )}}`;
            }
        }

        return css;
    };

    return function( style ){
        return getCSS( style );
    };
})();

var subtitlesStyleController = (function ( global, document, $ ) {
    'use strict';

    var subtitlesManager, $mainContainer, isPlaying;

    var childAddedListener;

    /* Private Methods */
    var injectStyle = function(){
        subtitlesManager.setTarget( $mainContainer ).createElement().updateStyle();
    };

    var maybeChangeSubtitlesPosition = function( e ){
        var translate,
            top = e.detail.$child[0].style.top,
            bottom = e.detail.$child[0].style.bottom;

        var position = ( top == '0' || top == '0px' || top == '24px' ) ? 'top' : 'bottom';

        if( position == 'top' ){
            e.detail.$child[0].classList.add('top');
        }else if( parseInt( bottom ) > 0 ){
            e.detail.$child[0].style.bottom = '0px';
        }
    };

    var startListenToSubtitlesPosition = async function(){

        var $positionParent = await traverseChildrenAsync( $mainContainer, ['div:last-of-type'] );

        $positionParent[0].addEventListener('child-added', maybeChangeSubtitlesPosition);

        listenToAddedChild( $positionParent[0], 'event', false );
    };

    var stopListenToSubtitlesPosition = async function(){

        var $positionParent = await traverseChildrenAsync( $mainContainer, ['div:last-of-type'] );

        $positionParent[0].removeEventListener( 'child-added', maybeChangeSubtitlesPosition);
    };

    var togglePlayerState = function(e){
        if( $(e.detail.target).is('.wrapper') ){

            var oldPlayerState = !!( isPlaying );

            isPlaying = ( e.type == 'class-show-added' );

            if( isPlaying != oldPlayerState ){

                if( isPlaying ){
                    startListenToSubtitlesPosition();
                }else{
                    stopListenToSubtitlesPosition();
                }

            }
        }
    };

    /* Public Methods */
    var init = function( $videoContainer ) {
        $mainContainer   = $videoContainer;
        subtitlesManager = window.subtitlesStyleManager;

        injectStyle();

        document.addEventListener('class-show-added', togglePlayerState);
        document.addEventListener('class-show-removed', togglePlayerState);


    };
    return {
        init: init,
    };

})( this, document, jQuery );

var userStyleController = (function ( global, document, $ ) {
    'use strict';

    var subtitlesManager, buttonsManager, $mainContainer, fontSizeButtonsTemplate = `
        <div class="footer__control subtitles-size-control">
            <span class="bigger-subtitles">A</span>
            <span class="smaller-subtitles">A</span>
        </div>`;

    const FONT_SIZE_DIFFERENCE = 4,
          MAX_FONT_SIZE = 999,
          MIN_FONT_SIZE = 0;

    /* Private Methods */
    var getCurrentFontSize = function(){
        var textRules = subtitlesManager.getRule( 'text' );
        return parseInt( textRules['font-size'] );
    };

    var getCurrentFontColor = function(){
        var textRules = subtitlesManager.getRule( 'text' );
        return textRules.color;
    };

    var getCurrentTextContrast = function(){
        var rule = subtitlesManager.getActiveRuleOfRuleset( 'text-contrast' );
        console.log(rule);
        return rule;
    };

    var injectStyle = function(){
        buttonsManager.setTarget( $mainContainer ).createElement().updateStyle();
    };

    var injectFontSizeButtons = function(){
        var $fontSizeButtons = $( fontSizeButtonsTemplate );

        $mainContainer.children('div.footer__row + div.footer__row').children('.footer__column:last-child').prepend( $fontSizeButtons );
        $fontSizeButtons.on('click', '.bigger-subtitles', increaseSubtitlesFontSize );
        $fontSizeButtons.on('click', '.smaller-subtitles', decreaseSubtitlesFontSize );
    };

    var updateTextContrast = function( contrastType ){
        subtitlesManager.changeRuleset( `text-contrast::${contrastType}` );
    };

    var updateFontSize = function( fontSize ){
        subtitlesManager.updateRule( 'text', {
            'font-size': `${fontSize}px`
        } ).setStyle().updateStyle();
    };

    var updateColor = function( color ){
        subtitlesManager.updateRule( 'text', {
            'color': `${color}`
        } ).setStyle().updateStyle();
    };

    var updateFontWeight = function( FontWeight ){
        subtitlesManager.updateRule( 'text', {
            'font-weight': `${FontWeight}`
        } ).setStyle().updateStyle();
    };

    /* Public Methods */
    var increaseSubtitlesFontSize = function(){
        var currentFontSize = getCurrentFontSize();
        updateFontSize( Math.min( currentFontSize + FONT_SIZE_DIFFERENCE, MAX_FONT_SIZE ) );
    };

    var decreaseSubtitlesFontSize = function(){
        var currentFontSize = getCurrentFontSize();
        updateFontSize( Math.max( currentFontSize - FONT_SIZE_DIFFERENCE, MIN_FONT_SIZE ) );
    };

    var init = function( $ampVideoPlayer ) {
        $mainContainer   = $ampVideoPlayer;
        subtitlesManager = window.subtitlesStyleManager;
        buttonsManager   = window.buttonsStyleManager;

        injectStyle();
        injectFontSizeButtons();
    };

    return {
        increaseSubtitlesFontSize: increaseSubtitlesFontSize,
        decreaseSubtitlesFontSize: decreaseSubtitlesFontSize,
        init: init,
    };
})( this, document, jQuery );

// main module
(function( global, document, $ ) {
    'use strict';

    var isVideoMode;

    window.subtitlesStyleManager = new styleManager( subtitlesStyleConfig );
    window.buttonsStyleManager   = new styleManager( buttonsStyleConfig );

    var init = function(){

        // option to monitor video mode on/off
        getTraversedElementAsync( '.wrapper' ).then(function( response ){
            listenToClassChange( response[0], 'show', 'event', false );
        });

        // init subtitles style
        var findVideoContainerMethods = [
            shadowDomListener( 'amp-video-player', '.video-container' ),
            getTraversedElementAsync( '.video-container' ),
        ];
        Promise.race( findVideoContainerMethods ).then( subtitlesStyleController.init );

        // init user style
        getTraversedElementAsync( 'amp-video-player' ).then( userStyleController.init );

    };

    $(function(){
        $(document).arrive("apple-tv-plus-player", {onceOnly: true, existing: true}, function(){
            if( !$(this).hasClass('hydrated') ){

                document.addEventListener('class-hydrated-added', init, {once: true} );

                listenToClassChange( this, 'hydrated', 'event', true );
            }else{
                init();
            }
        });
     });

})( this, document, jQuery );