var listenToClassChange = (function( document ) {

    var runObserver = function(element, className, responseType, once, callback){

        var triggerCount = 0;

        if( responseType == 'event' ){
            var classAddedEvent   = new CustomEvent(`class-${className}-added`, {bubbles: true, detail: {target: element}});
            var classRemovedEvent = new CustomEvent(`class-${className}-removed`, {bubbles: true, detail: {target: element}});
        }

        const observer = new MutationObserver((mutations) => {

            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];

                if (className && mutation.attributeName == 'class') {

                    if( ( !mutation.oldValue || !mutation.oldValue.includes( className ) ) && mutation.target.classList.contains( className ) ){

                        triggerCount++;

                        switch( responseType ){
                            case 'event':
                                document.dispatchEvent( classAddedEvent );
                                break;
                            case 'callback':
                                callback( true );
                                break;
                        }

                        break;

                    }else if( mutation.oldValue.includes( className ) && !mutation.target.classList.contains( className ) ){

                        triggerCount++;

                        switch( responseType ){
                            case 'event':
                                document.dispatchEvent( classRemovedEvent );
                                break;
                            case 'callback':
                                callback( false );
                                break;
                        }

                        break;

                    }

                    if( triggerCount > 0 && once ){
                        observer.disconnect();
                    }
                }
            }
        });

        observer.observe(element, {
            attributes:        true,
            attributeOldValue: true,
            attributeFilter:   [ 'class' ]
        });
    };

    return function(element, className, responseType, once, callback) {

        once = ( once === false ) ? false: true;
        responseType = responseType || 'promise';
        callback = callback || null;

        if( responseType == 'promise' ){
            return new Promise((resolve, reject) => {
                runObserver(element, className, 'callback', true, function( classExist ){
                    if( !classExist ) return reject();
                    resolve();
                });
            });
        }else{
            runObserver(element, className, responseType, once, callback);
        }


    };
})( document );

var listenToStyleChange = (function( document ) {

    var runObserver = function(element, propertyName, responseType, once, callback){

        var triggerCount = 0;

        if( responseType == 'event' ){
            var styleChangedEvent   = new CustomEvent(`style-${propertyName}-changed`, {bubbles: true, detail: {target: element}});
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // if attributeName is given and we have a matching change, disconnect and resolve
                if (mutation.attributeName == 'style') {

                    if( propertyName ){
                        console.log(mutation.oldValue);
                        console.log(mutation);
                    }else{
                        triggerCount++;

                        switch( responseType ){
                            case 'event':
                                document.dispatchEvent( styleChangedEvent );
                                break;
                            case 'callback':
                                callback( $propertyValue );
                                break;
                        }
                    }

                    if( triggerCount > 0 && once ){
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(element, {
            attributes: true,
        });
    };

    return function(element, propertyName, responseType, once, callback) {

        once = ( once === false ) ? false: true;
        responseType = responseType || 'promise';
        callback = callback || null;

        if( responseType == 'promise' ){
            return new Promise((resolve, reject) => {
                runObserver(element, propertyName, 'callback', true, resolve);
            });
        }else{
            runObserver(element, propertyName, responseType, once, callback);
        }


    };
})( document );

var listenToAddedChild = (function( document ) {

    var runObserver = function(element, responseType, once, callback){

        var triggerCount = 0;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if ( mutation.addedNodes ) {

                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const $child = $( mutation.addedNodes[i] );

                        triggerCount++;

                        switch( responseType ){
                            case 'event':
                                element.dispatchEvent( new CustomEvent(`child-added`, {detail: {target: element, $child: $child}} ) );
                                break;
                            case 'callback':
                                callback( $child );
                                break;
                        }

                    }

                    if( triggerCount > 0 && once ){
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(element, {
            childList: true,
        });
    };

    return function(element, responseType, once, callback) {

        once = ( once === false ) ? false: true;
        responseType = responseType || 'promise';
        callback = callback || null;

        if( responseType == 'promise' ){
            return new Promise((resolve, reject) => {
                runObserver(element, 'callback', true, resolve);
            });
        }else{
            runObserver(element, responseType, once, callback);
        }


    };
})( document );

var domSteps = (function(){
    var elementsSteps = [
        'amp-mediakit-root', 'apple-tv-plus-player', null, '.wrapper', 'amp-video-player-internal', null, 'amp-video-player', null, '.video-container'
    ];

    return {
        getSteps: function( selector ){
            var index = elementsSteps.indexOf( selector );

            return elementsSteps.slice( 0, index + 1 );
        },

        getRootElement: function(){
            return $('body');
        }
    };
})();

var traverseChildrenAsync = (function( $ ) {

    var isShadowElement = function( el ){
        return el.toString() == '[object ShadowRoot]';
    };

    var getChildElementAsync = async function( $el, selector ){

        var $child = ( selector === null ) ? $( $el[0].shadowRoot ) : $el.children( selector );

        if( !$child.length ){
            $child = await getFutureChildAsync( $el[0], selector );
        }

        return $child;
    };

    var getFutureChildAsync = function(element, childSelector, rejectTime = 0) {
        return new Promise((resolve, reject) => {
            let childAdded = false;
            const observerConfig = {childList: true};
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {

                    // if attributeName is given and we have a matching change, disconnect and resolve
                    if ( mutation.addedNodes ) {

                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const $child = $( mutation.addedNodes[i] );

                            if( $child.is( childSelector ) || ( childSelector === null && isShadowElement( $child[0] ) ) ){
                                childAdded = true;
                                observer.disconnect();
                                resolve($child);
                            }

                        }
                    }
                });
            });

            // Add a reject time if provided. Doesn't use recurrsion, but should it?
            if (rejectTime > 0) {
                window.setTimeout(()=>{
                    if (!childAdded) {
                        reject(element);
                    }
                },rejectTime * 100);
            }

            observer.observe(element, observerConfig);
        });
    };

    return async function( $el, steps ){

        var nextStep = steps.shift();
        if( nextStep === null && !$el.hasClass('hydrated') ){
            await listenToClassChange( $el[0], 'hydrated' );
        }
        var $nextChild = await getChildElementAsync( $el, nextStep );

        return ( steps.length ) ? traverseChildrenAsync( $nextChild, steps ) : $nextChild;
    };
})( jQuery );

var shadowDomListener = (function( document, $ ){

    var runShadowObserver = function(hostSelector, targetSelector, responseType, once, callback){

        var triggerCount = 0;

        if( responseType == 'event' ){
            var elementAddedEvent   = new CustomEvent(`element-${targetSelector}-added`, {bubbles: true, detail: {target: element}});
            var elementRemovedEvent = new CustomEvent(`element-${targetSelector}-removed`, {bubbles: true, detail: {target: element}});
        }

        var handle = ally.observe.shadowMutations({
            callback: function(mutations) {

                mutations.forEach((mutation) => {
                    if( mutation.type == 'childList' && $(mutation.target.host).is( hostSelector ) ){

                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const $addedChild = $( mutation.addedNodes[i] );

                            if( $addedChild.is( targetSelector ) ){
                                triggerCount++;

                                switch( responseType ){
                                    case 'event':
                                        document.dispatchEvent( elementAddedEvent );
                                        break;
                                    case 'callback':
                                        callback( $addedChild );
                                        break;
                                }
                            }
                        }

                        for (let i = 0; i < mutation.removedNodes.length; i++) {
                            const $removedChild = $( mutation.removedNodes[i] );

                            if( $removedChild.is( targetSelector ) ){
                                triggerCount++;

                                switch( responseType ){
                                    case 'event':
                                            document.dispatchEvent( elementRemovedEvent );
                                        break;
                                    case 'callback':
                                        callback( false );
                                        break;
                                }
                            }
                        }
                    }

                    if( triggerCount > 0 && once ){
                        handle.disengage();
                    }
                });


            },
            config: {
                childList: true,
            },
        });

    };

    return function(hostSelector, targetSelector, responseType, once, callback) {

        once = ( once === false ) ? false: true;
        responseType = responseType || 'promise';
        callback = callback || null;

        if( responseType == 'promise' ){
            return new Promise((resolve, reject) => {
                runShadowObserver(hostSelector, targetSelector, 'callback', true, function( $element ){
                    if( !$element ) return reject();
                    resolve( $element );
                });
            });
        }else{
            runShadowObserver(hostSelector, targetSelector, responseType, once, callback);
        }


    };
})( document, jQuery );

var getTraversedElementAsync = function( destinationSelector ){
    var $root = domSteps.getRootElement(),
        traverseSteps = domSteps.getSteps( destinationSelector );

    return traverseChildrenAsync( $root, traverseSteps );
};