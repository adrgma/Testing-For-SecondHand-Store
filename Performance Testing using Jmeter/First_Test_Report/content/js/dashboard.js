/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9583333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET/seller/product"], "isController": false}, {"data": [1.0, 500, 1500, "GET/buyer/product/id"], "isController": false}, {"data": [1.0, 500, 1500, "POST/buyer/order"], "isController": false}, {"data": [1.0, 500, 1500, "GET/buyer/order/id"], "isController": false}, {"data": [0.5, 500, 1500, "POST/auth/register"], "isController": false}, {"data": [1.0, 500, 1500, "GET/buyer/product"], "isController": false}, {"data": [1.0, 500, 1500, "POST/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "POST/seller/product"], "isController": false}, {"data": [1.0, 500, 1500, "PUT/buyer/order/id"], "isController": false}, {"data": [1.0, 500, 1500, "GET/seller/product/id"], "isController": false}, {"data": [1.0, 500, 1500, "GET/buyer/order"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE/seller/product/id"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 60, 0, 0.0, 367.31666666666666, 269, 1189, 289.5, 348.7, 1171.8, 1189.0, 4.826643069744992, 5.1963400470597705, 6.9247873260397395], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET/seller/product", 5, 0, 0.0, 285.8, 280, 293, 284.0, 293.0, 293.0, 293.0, 0.6037189084762135, 1.1839729609393865, 0.20752837478869837], "isController": false}, {"data": ["GET/buyer/product/id", 5, 0, 0.0, 279.4, 269, 293, 273.0, 293.0, 293.0, 293.0, 0.6024096385542169, 0.5819371234939759, 0.21001976656626503], "isController": false}, {"data": ["POST/buyer/order", 5, 0, 0.0, 288.4, 285, 292, 289.0, 292.0, 292.0, 292.0, 0.6009615384615385, 0.4054142878605769, 0.24766188401442307], "isController": false}, {"data": ["GET/buyer/order/id", 5, 0, 0.0, 284.8, 281, 290, 284.0, 290.0, 290.0, 290.0, 0.600817111271329, 0.7444499519346311, 0.20829108838019708], "isController": false}, {"data": ["POST/auth/register", 5, 0, 0.0, 1174.2, 1167, 1189, 1172.0, 1189.0, 1189.0, 1189.0, 0.5450185306300414, 0.3294594438085895, 0.24483254305646393], "isController": false}, {"data": ["GET/buyer/product", 5, 0, 0.0, 304.4, 297, 309, 307.0, 309.0, 309.0, 309.0, 0.600672753483902, 0.7027401940172994, 0.23346460535800095], "isController": false}, {"data": ["POST/auth/login", 5, 0, 0.0, 343.2, 337, 349, 344.0, 349.0, 349.0, 349.0, 0.600168047053175, 0.3082894460448926, 0.17817488896891132], "isController": false}, {"data": ["POST/seller/product", 5, 0, 0.0, 306.6, 292, 317, 311.0, 317.0, 317.0, 317.0, 0.6024096385542169, 0.451218938253012, 7.937570594879517], "isController": false}, {"data": ["PUT/buyer/order/id", 5, 0, 0.0, 285.0, 278, 295, 282.0, 295.0, 295.0, 295.0, 0.6009615384615385, 0.40494478665865385, 0.23592435396634615], "isController": false}, {"data": ["GET/seller/product/id", 5, 0, 0.0, 288.2, 280, 301, 287.0, 301.0, 301.0, 301.0, 0.6032090722644469, 0.44887237604053565, 0.2108875467487031], "isController": false}, {"data": ["GET/buyer/order", 5, 0, 0.0, 281.4, 273, 289, 283.0, 289.0, 289.0, 289.0, 0.6013952369497233, 1.9898899822588405, 0.20496771259321625], "isController": false}, {"data": ["DELETE/seller/product/id", 5, 0, 0.0, 286.4, 282, 292, 286.0, 292.0, 292.0, 292.0, 0.6025548324897565, 0.18947525006025548, 0.2236043323692456], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 60, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
