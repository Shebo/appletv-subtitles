var cols = {
    'Site Name': {
        val: 'string',
    },
    'Extracted Date': {
        val: 'string',
    },
    'Unique Reviews': {
        val: 'int',
    },
    'Reviews': {
        val: 'int',
    },
    'Items / Variants': {
        val: 'int',
    },
    'Average Rev/Item': {
        val: function(reviews, items){
            return reviews / items;
        },
    },
    '0 > 1+ Items': {
        val: 'int',
    },
    '0 > 1+ % Items': {
        val: function(cov, items){
            return cov / items;
        },
    },
    '> 5+ Items': {
        val: 'int',
    },
    '> 5+ % Items': {
        val: function(depth, items){
            return depth / items;
        },
    },
    'Head items': {
        val: 'int',
    },
    'Torso items': {
        val: 'int',
    },
};

function get_data_by_sites(){
    var sites = {};
    var rowsLength = $('table.dataTable tbody tr').length
    $('table.dataTable tbody tr:not(.summary)').each(function(index, el){
        var siteName = $(el).find('td.site-name').text();

        sites[siteName] = sites[siteName] || {};

        var line = {}

        var i = 1;
        for (var colName in cols) {
            var value = $(el).find('td:nth-child('+i+')').text();

            if( cols[colName].val == 'int' && cols[colName].val != '-' ){
                value = parseInt(value.split(",").join(""));
            }

            sites[siteName][colName] = sites[siteName][colName] || [];
            sites[siteName][colName].push(value)

            i++;
        }

    });
    return sites;
}

function get_total_by_sites(sitesData){

    var total_by_site = [];

    for (var site in sitesData) {

        var line = {};
        for (var colName in sitesData[site]) {
            var valArr = sitesData[site][colName];

            if(cols[colName].val == 'int'){
                line[colName] = valArr.reduce(function(acc, val) { return acc + val; }, 0);
                if(Number.isNaN(line[colName])){
                    line[colName] = '-';
                }
            }
        }

        line['Site Name'] = site;
        line['Average Rev/Item'] = (Number.isInteger(line['Reviews'])) ? cols['Average Rev/Item'].val(line['Reviews'], line['Items / Variants']) : '-';
        line['0 > 1+ % Items'] = (Number.isInteger(line['0 > 1+ Items'])) ? cols['Average Rev/Item'].val(line['0 > 1+ Items'], line['Items / Variants']) : '-';
        line['> 5+ % Items'] = (Number.isInteger(line['> 5+ Items'])) ? cols['Average Rev/Item'].val(line['> 5+ Items'], line['Items / Variants']) : '-';

        total_by_site.push(line)

    }

    return total_by_site;

}

function get_data_as_rows(sitesTotal){
    var rows = [];

    rows.push([
        'Site Name',
        'Unique Reviews',
        'Reviews',
        'Items / Variants',
        'Average Rev/Item',
        '0 > 1+ Items',
        '0 > 1+ % Items',
        '> 5+ Items',
        '> 5+ % Items',
        'Head items',
        'Torso items',
    ]);

    for (let i = 0; i < sitesTotal.length; i++) {
        const site = sitesTotal[i];
        rows.push([
            sitesTotal[i]['Site Name'],
            sitesTotal[i]['Unique Reviews'],
            sitesTotal[i]['Reviews'],
            sitesTotal[i]['Items / Variants'],
            sitesTotal[i]['Average Rev/Item'],
            sitesTotal[i]['0 > 1+ Items'],
            sitesTotal[i]['0 > 1+ % Items'],
            sitesTotal[i]['> 5+ Items'],
            sitesTotal[i]['> 5+ % Items'],
            sitesTotal[i]['Head items'],
            sitesTotal[i]['Torso items'],
        ]);
    }

    return rows;
}

function createCSV(rows){
    let csvContent = "data:text/csv;charset=utf-8,";

    rows.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });

    // var encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);

    var encodedUri = encodeURI(csvContent);

    return encodedUri;
}

function createButton(encodedUri){

    var date = new Date(Date.now());
    var timestamp = date.getFullYear()+ '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    var link = document.createElement("a");
    link.innerHTML = 'Export By Sites';
    link.setAttribute("id", 'special');
    link.setAttribute("class", 'btn btn-lg btn-primary');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "syndication_sites_totals_"+timestamp+".csv");
    document.body.appendChild(link);

    var linkWrapper = $("<div></div>").attr({
        'class': 'pull-right'
    }).css({
        'margin-right': '2rem'
    }).append(link);

    $('.toolbar').append(linkWrapper);
}


function fetchAndSetData(){
    var sitesData  = get_data_by_sites();
    var sitesTotal = get_total_by_sites(sitesData);
    var rows       = get_data_as_rows(sitesTotal);
    var encodedUri = createCSV(rows);
    createButton(encodedUri);
}


function waitUntilExists(callback){

    selectors = ['table.dataTable', '.info-box', '.main-footer'];

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            console.log('printprint!!!');
            if (!mutation.addedNodes) return

            console.log('existy111112!!!');
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                // do things to your newly added nodes here
                var node = mutation.addedNodes[i];
                console.log('existy!!!');
                console.log(node);
                callback();
            }
        })
    });

    var elArr = []

    for (let i = 0; i < selectors.length; i++) {
        var el = $(selectors[i])
        if( !el.length ){
            elArr.push(el);
        }
    }

    if( !elArr.length ){
        callback();
    }else{
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
        });
    }
}

function listenToChanges(callback){
    var observer = new MutationObserver(function(mutationRecords) {
        console.info ("mutationHandler:");

        mutationRecords.forEach ( function (mutation) {
            console.log (mutation.type);

            if (typeof mutation.removedNodes == "object") {
                var jq = $(mutation.removedNodes);
                console.log (jq);
                console.log (jq.is("span.myclass2"));
                console.log (jq.find("span") );
            }
        } );
    });

    $('.info-box').each ( function () {
        observer.observe(this, {childList: true, characterData: true, attributes: true, subtree: true});
    } );
}

(function($) {

    $(function() {

        console.log('asdsadsadasd1132134');
        waitUntilExists(function(){
            console.log('sadfsfsdf25')
            // fetchAndSetData();
        });

        listenToChanges(function(){
            console.log('sadfsfsdf34')
            // fetchAndSetData();
        })

    });


})(jQuery);
