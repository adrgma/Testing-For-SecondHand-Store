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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.95, 500, 1500, "GET/seller/product"], "isController": false}, {"data": [1.0, 500, 1500, "GET/buyer/product/id"], "isController": false}, {"data": [1.0, 500, 1500, "POST/buyer/order"], "isController": false}, {"data": [0.95, 500, 1500, "GET/buyer/order/id"], "isController": false}, {"data": [0.5, 500, 1500, "POST/auth/register"], "isController": false}, {"data": [0.95, 500, 1500, "GET/buyer/product"], "isController": false}, {"data": [1.0, 500, 1500, "POST/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "POST/seller/product"], "isController": false}, {"data": [1.0, 500, 1500, "PUT/buyer/order/id"], "isController": false}, {"data": [1.0, 500, 1500, "GET/seller/product/id"], "isController": false}, {"data": [0.9, 500, 1500, "GET/buyer/order"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE/seller/product/id"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120, 0, 0.0, 377.7250000000001, 255, 1442, 285.0, 580.5000000000002, 1131.95, 1390.339999999998, 8.139456013023128, 9.795101382859661, 11.701991517160685], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET/seller/product", 10, 0, 0.0, 408.40000000000003, 264, 1442, 282.5, 1333.5000000000005, 1442.0, 1442.0, 0.9597850081581726, 1.7749461620596985, 0.33170694764372777], "isController": false}, {"data": ["GET/buyer/product/id", 10, 0, 0.0, 264.8, 255, 273, 265.0, 273.0, 273.0, 273.0, 0.9611687812379854, 0.9027852869088812, 0.33687839412725873], "isController": false}, {"data": ["POST/buyer/order", 10, 0, 0.0, 287.1, 267, 349, 283.5, 342.90000000000003, 349.0, 349.0, 0.9588647041902388, 0.6423644405024451, 0.39693627744750215], "isController": false}, {"data": ["GET/buyer/order/id", 10, 0, 0.0, 302.5, 261, 549, 276.0, 523.2, 549.0, 549.0, 0.9370314842578711, 1.1816296441622938, 0.32658841477698647], "isController": false}, {"data": ["POST/auth/register", 10, 0, 0.0, 1139.3000000000002, 1104, 1196, 1131.5, 1193.7, 1196.0, 1196.0, 0.9859016070196194, 0.595777260179434, 0.44365572315882873], "isController": false}, {"data": ["GET/buyer/product", 10, 0, 0.0, 329.0, 280, 584, 303.5, 557.9000000000001, 584.0, 584.0, 0.9565716472163766, 1.1191140950832217, 0.3735673844939736], "isController": false}, {"data": ["POST/auth/login", 10, 0, 0.0, 335.7, 326, 350, 335.5, 348.9, 350.0, 350.0, 1.0774701002047193, 0.5574645108285745, 0.3218731480982652], "isController": false}, {"data": ["POST/seller/product", 10, 0, 0.0, 294.1, 276, 320, 289.5, 319.4, 320.0, 320.0, 1.0795638562020944, 0.8086186305732485, 14.243601053924214], "isController": false}, {"data": ["PUT/buyer/order/id", 10, 0, 0.0, 283.8, 270, 313, 283.5, 310.8, 313.0, 313.0, 0.936855911560802, 0.6216734295952783, 0.3686125456717257], "isController": false}, {"data": ["GET/seller/product/id", 10, 0, 0.0, 281.1, 269, 329, 274.0, 324.70000000000005, 329.0, 329.0, 0.9612611746611555, 0.7208520078342785, 0.33784950855522444], "isController": false}, {"data": ["GET/buyer/order", 10, 0, 0.0, 325.2, 266, 530, 279.0, 528.0, 530.0, 530.0, 0.9364172675344132, 4.637917437260043, 0.32088751872834537], "isController": false}, {"data": ["DELETE/seller/product/id", 10, 0, 0.0, 281.70000000000005, 268, 303, 279.0, 302.7, 303.0, 303.0, 0.9586808551433228, 0.3014601907774902, 0.3575392759562842], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
