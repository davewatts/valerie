﻿// valerie.numericHelper
// - helper for parsing and formatting numeric values
// - used by other parts of the valerie library
// (c) 2013 egrove Ltd.
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

/// <reference path="../core/valerie.formatting.js"/>

/*global valerie: true */

var valerie = valerie || {};

(function () {
    "use strict";

    var formatting = valerie.formatting,
        formatExpression = new RegExp("^(\\C?)(\\,?)(\\.?(c|\\d*))$"),
        formatStringAsOptions = function(numericHelper, format) {
            var settings = numericHelper.settings,
                matches = formatExpression.exec(format),
                includeCurrencySign = false,
                includeThousandsSeparator = false,
                withDecimalPlaces,
                numberOfDecimalPlacesSpecified,
                numberOfDecimalPlaces;

            if (matches !== null) {
                includeCurrencySign = matches[1].length > 0;
                includeThousandsSeparator = matches[2].length > 0;
                withDecimalPlaces = matches[3].length > 0;
                numberOfDecimalPlacesSpecified = matches[4].length > 0;

                if (withDecimalPlaces) {
                    if (numberOfDecimalPlacesSpecified) {
                        numberOfDecimalPlaces = matches[4];

                        if (numberOfDecimalPlaces === "c") {
                            numberOfDecimalPlaces = settings.currencyMinorUnitPlaces;
                        } else {
                            numberOfDecimalPlaces = Number(numberOfDecimalPlaces);
                        }
                    }
                } else {
                    numberOfDecimalPlaces = 0;
                }
            }

            return {
                "includeCurrencySign": includeCurrencySign,
                "includeThousandsSeparator": includeThousandsSeparator,
                // ReSharper disable UsageOfPossiblyUnassignedValue
                "numberOfDecimalPlaces": numberOfDecimalPlaces
                // ReSharper restore UsageOfPossiblyUnassignedValue
            };
        };

    // + valerie.NumericHelper
    valerie.NumericHelper = function () {
    };

    valerie.NumericHelper.prototype = {
        "init": function (decimalSeparator, thousandsSeparator, currencySign, currencyMinorUnitPlaces) {
            var integerExpression = "\\d+(\\" + thousandsSeparator + "\\d{3})*",
                currencyMajorExpression = "(\\" + currencySign + ")?" + integerExpression,
                currentMajorMinorExpression = currencyMajorExpression + "(\\" +
                    decimalSeparator + "\\d{" + currencyMinorUnitPlaces + "})?",
                floatExpression = integerExpression + "(\\" + decimalSeparator + "\\d+)?";

            this.settings = {
                "decimalSeparator": decimalSeparator,
                "thousandsSeparator": thousandsSeparator,
                "currencySign": currencySign,
                "currencyMinorUnitPlaces": currencyMinorUnitPlaces
            };

            this.expressions = {
                "currencyMajor": new RegExp("^" + currencyMajorExpression + "$"),
                "currencyMajorMinor": new RegExp("^" + currentMajorMinorExpression + "$"),
                "float": new RegExp("^" + floatExpression + "$"),
                "integer": new RegExp("^" + integerExpression + "$")
            };

            return this;
        },
        "addThousandsSeparator": function (numericString) {
            var settings = this.settings;

            return formatting.addThousandsSeparator(numericString, settings.thousandsSeparator,
                settings.decimalSeparator);
        },
        "format": function (value, format) {
            if (value === undefined || value === null) {
                return "";
            }

            if (format === undefined || format === null) {
                format = "";
            }

            var settings = this.settings,
                formatOptions = formatStringAsOptions(this, format),
                numberOfDecimalPlaces = formatOptions.numberOfDecimalPlaces,
                negative = value < 0;

            if (negative) {
                value = -value;
            }

            if (numberOfDecimalPlaces !== undefined) {
                value = value.toFixed(numberOfDecimalPlaces);
            } else {
                value = value.toString();
            }

            value = value.replace(".", settings.decimalSeparator);

            if (formatOptions.includeThousandsSeparator) {
                value = this.addThousandsSeparator(value);
            }

            return (negative ? "-" : "") +
                (formatOptions.includeCurrencySign ? settings.currencySign : "") +
                value;
        },
        "isCurrencyMajor": function (numericString) {
            return this.expressions.currencyMajor.test(numericString);
        },
        "isCurrencyMajorMinor": function (numericString) {
            return this.expressions.currencyMajorMinor.test(numericString);
        },
        "isFloat": function (numericString) {
            return this.expressions.float.test(numericString);
        },
        "isInteger": function (numericString) {
            return this.expressions.integer.test(numericString);
        },
        "parse": function (numericString) {
            numericString = this.unformat(numericString);

            return Number(numericString);
        },
        "unformat": function (numericString) {
            var settings = this.settings;

            numericString = numericString.replace(settings.currencySign, "");
            numericString = numericString.replace(settings.thousandsSeparator, "");
            numericString = numericString.replace(settings.decimalSeparator, ".");

            return numericString;
        }
    };
})();