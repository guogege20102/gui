/*
 Data plugin for Highcharts

 (c) 2012-2014 Torstein Honsi

 License: www.highcharts.com/license
 */
(function (j) {
    var m = j.each, n = function (b, a) {
        this.init(b, a)
    };
    j.extend(n.prototype, {init: function (b, a) {
        this.options = b;
        this.chartOptions = a;
        this.columns = b.columns || this.rowsToColumns(b.rows) || [];
        this.columns.length ? this.dataFound() : (this.parseCSV(), this.parseTable(), this.parseGoogleSpreadsheet())
    }, getColumnDistribution: function () {
        var b = this.chartOptions, a = b && b.chart && b.chart.type, c = [];
        m(b && b.series || [], function (b) {
            c.push((j.seriesTypes[b.type || a || "line"].prototype.pointArrayMap || [0]).length)
        });
        this.valueCount =
        {global: (j.seriesTypes[a || "line"].prototype.pointArrayMap || [0]).length, individual: c}
    }, dataFound: function () {
        if (this.options.switchRowsAndColumns)this.columns = this.rowsToColumns(this.columns);
        this.parseTypes();
        this.findHeaderRow();
        this.parsed();
        this.complete()
    }, parseCSV: function () {
        var b = this, a = this.options, c = a.csv, d = this.columns, e = a.startRow || 0, f = a.endRow || Number.MAX_VALUE, i = a.startColumn || 0, h = a.endColumn || Number.MAX_VALUE, g, k, o = 0;
        c && (k = c.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(a.lineDelimiter ||
            "\n"), g = a.itemDelimiter || (c.indexOf("\t") !== -1 ? "\t" : ","), m(k, function (a, c) {
            var k = b.trim(a), j = k.indexOf("#") === 0;
            c >= e && c <= f && !j && k !== "" && (k = a.split(g), m(k, function (b, a) {
                a >= i && a <= h && (d[a - i] || (d[a - i] = []), d[a - i][o] = b)
            }), o += 1)
        }), this.dataFound())
    }, parseTable: function () {
        var b = this.options, a = b.table, c = this.columns, d = b.startRow || 0, e = b.endRow || Number.MAX_VALUE, f = b.startColumn || 0, i = b.endColumn || Number.MAX_VALUE;
        a && (typeof a === "string" && (a = document.getElementById(a)), m(a.getElementsByTagName("tr"), function (a, b) {
            b >= d && b <= e && m(a.children, function (a, e) {
                if ((a.tagName === "TD" || a.tagName === "TH") && e >= f && e <= i)c[e - f] || (c[e - f] = []), c[e - f][b - d] = a.innerHTML
            })
        }), this.dataFound())
    }, parseGoogleSpreadsheet: function () {
        var b = this, a = this.options, c = a.googleSpreadsheetKey, d = this.columns, e = a.startRow || 0, f = a.endRow || Number.MAX_VALUE, i = a.startColumn || 0, h = a.endColumn || Number.MAX_VALUE, g, k;
        c && jQuery.ajax({dataType: "json", url: "https://spreadsheets.google.com/feeds/cells/" + c + "/" + (a.googleSpreadsheetWorksheet || "od6") + "/public/values?alt=json-in-script&callback=?",
            error: a.error, success: function (a) {
                var a = a.feed.entry, c, j = a.length, m = 0, n = 0, l;
                for (l = 0; l < j; l++)c = a[l], m = Math.max(m, c.gs$cell.col), n = Math.max(n, c.gs$cell.row);
                for (l = 0; l < m; l++)if (l >= i && l <= h)d[l - i] = [], d[l - i].length = Math.min(n, f - e);
                for (l = 0; l < j; l++)if (c = a[l], g = c.gs$cell.row - 1, k = c.gs$cell.col - 1, k >= i && k <= h && g >= e && g <= f)d[k - i][g - e] = c.content.$t;
                b.dataFound()
            }})
    }, findHeaderRow: function () {
        m(this.columns, function () {
        });
        this.headerRow = 0
    }, trim: function (b) {
        return typeof b === "string" ? b.replace(/^\s+|\s+$/g, "") : b
    }, parseTypes: function () {
        for (var b =
            this.columns, a = b.length, c, d, e, f; a--;)for (c = b[a].length; c--;)d = b[a][c], e = parseFloat(d), f = this.trim(d), f == e ? (b[a][c] = e, e > 31536E6 ? b[a].isDatetime = !0 : b[a].isNumeric = !0) : (d = this.parseDate(d), a === 0 && typeof d === "number" && !isNaN(d) ? (b[a][c] = d, b[a].isDatetime = !0) : b[a][c] = f === "" ? null : f)
    }, dateFormats: {"YYYY-mm-dd": {regex: "^([0-9]{4})-([0-9]{2})-([0-9]{2})$", parser: function (b) {
        return Date.UTC(+b[1], b[2] - 1, +b[3])
    }}}, parseDate: function (b) {
        var a = this.options.parseDate, c, d, e;
        a && (c = a(b));
        if (typeof b === "string")for (d in this.dateFormats)a =
            this.dateFormats[d], (e = b.match(a.regex)) && (c = a.parser(e));
        return c
    }, rowsToColumns: function (b) {
        var a, c, d, e, f;
        if (b) {
            f = [];
            c = b.length;
            for (a = 0; a < c; a++) {
                e = b[a].length;
                for (d = 0; d < e; d++)f[d] || (f[d] = []), f[d][a] = b[a][d]
            }
        }
        return f
    }, parsed: function () {
        this.options.parsed && this.options.parsed.call(this, this.columns)
    }, complete: function () {
        var b = this.columns, a, c, d = this.options, e, f, i, h, g, k;
        if (d.complete || d.afterComplete) {
            this.getColumnDistribution();
            b.length > 1 && (a = b.shift(), this.headerRow === 0 && a.shift(), a.isDatetime ?
                c = "datetime" : a.isNumeric || (c = "category"));
            for (h = 0; h < b.length; h++)if (this.headerRow === 0)b[h].name = b[h].shift();
            f = [];
            for (h = 0, k = 0; h < b.length; k++) {
                e = j.pick(this.valueCount.individual[k], this.valueCount.global);
                i = [];
                if (h + e <= b.length)for (g = 0; g < b[h].length; g++)i[g] = [a[g], b[h][g] !== void 0 ? b[h][g] : null], e > 1 && i[g].push(b[h + 1][g] !== void 0 ? b[h + 1][g] : null), e > 2 && i[g].push(b[h + 2][g] !== void 0 ? b[h + 2][g] : null), e > 3 && i[g].push(b[h + 3][g] !== void 0 ? b[h + 3][g] : null), e > 4 && i[g].push(b[h + 4][g] !== void 0 ? b[h + 4][g] : null);
                f[k] =
                {name: b[h].name, data: i};
                h += e
            }
            b = {xAxis: {type: c}, series: f};
            d.complete && d.complete(b);
            d.afterComplete && d.afterComplete(b)
        }
    }});
    j.Data = n;
    j.data = function (b, a) {
        return new n(b, a)
    };
    j.wrap(j.Chart.prototype, "init", function (b, a, c) {
        var d = this;
        a && a.data ? j.data(j.extend(a.data, {afterComplete: function (e) {
            var f, i;
            if (a.hasOwnProperty("series"))if (typeof a.series === "object")for (f = Math.max(a.series.length, e.series.length); f--;)i = a.series[f] || {}, a.series[f] = j.merge(i, e.series[f]); else delete a.series;
            a = j.merge(e, a);
            b.call(d, a, c)
        }}), a) : b.call(d, a, c)
    })
})(Highcharts);
