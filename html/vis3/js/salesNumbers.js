/**
 * Created by mund on 18/04/2016.
 */
SalesNumbers = function(_data ) {
    this.data = _data;
    this.init();
};

SalesNumbers.prototype.init = function() {
var sales = this;
};

SalesNumbers.prototype.byManufacturer = function(Manufacturer) {
    var sales = this;
    var sum = 0;
        sales.data.forEach(function(d){
                if (d.key.trim() == Manufacturer) {
                    d.values.forEach(function(e){
                        Object.keys(e.values[0]).forEach( function(f) {
                            var val = e.values[0][f].trim();
                            sum += (isNaN(+val) ? 0 : +val);
                        })
                    })
                }

        });
return sum;
};

SalesNumbers.prototype.byList = function(list) {
    var sales = this;
    var sum = 0;
    list.forEach(function (d){
        sum += sales.byManufacturer(d);
    });
    return sum;
};

SalesNumbers.prototype.byModel = function(Model) {
    var sales = this;

};


