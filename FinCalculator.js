'use strict';

var program = require('commander');
var tax = require('./Tax.json').Tax;
CalculateCarry();
var expenses = require('./Expenses.json').Expenses;
var incomeband = require('./IncomeBand.json').IncomeBand;

program
    .command('FinCalc <GrossIncome> <RentalIncome> <NoOfChildren>')
    .description('Calculates the output of the financial calculator.')
    .action((GrossIncome, RentalIncome, NoOfChildren) => {
        var IncomeTax = 0;
        var RentalIncomeOutput = 0;
        var TotalIncome = 0;
        var iband = 0;
        var Expense = 0;
        var giError = false;
        var riError = false;
        var iError = false;
        var eError = false;
        var Surplus = 0;
        if (isNumeric(GrossIncome)) {
            if (GrossIncome <= 0) {
                IncomeTax = 0;
            } else {
                var TaxRow = GetTaxRow(GrossIncome);
                IncomeTax = (GrossIncome - tax[TaxRow].ULimit) * tax[TaxRow].Rate + tax[TaxRow].Carry;
            }
        } else {
            giError = true;
        }
        if (isNumeric(RentalIncome)) {
            RentalIncomeOutput = RentalIncome * 0.8;
        } else {
            riError = true;
        }
        TotalIncome = GrossIncome - IncomeTax + RentalIncomeOutput;
        iband = GetIncomeBand(TotalIncome) + 1;
        iError = iband < 2;
        if (Number(NoOfChildren) < 0 || Number(NoOfChildren) > expenses[expenses.length - 1][1]) {
            eError = true;
        } else {
            Expense = expenses[Number(NoOfChildren)][iband];
            Surplus = TotalIncome - Expense;
        }
        if (giError) {
            console.log('Income Tax:    ' + '#VALUE!');
        } else {
            console.log('Income Tax:    ' + round(IncomeTax, 2));
        }
        if (riError) {
            console.log('Rental Income: ' + '#VALUE!');
        } else {
            console.log('Rental Income: ' + round(RentalIncomeOutput, 2));
        }
        if (giError || riError) {
            console.log('Total Income:  ' + '#VALUE!');
        } else {
            console.log('Total Income:  ' + round(TotalIncome, 2));
        }
        if (iError) {
            console.log('Expense:       ' + '#REF!');
            console.log('Surplus:       ' + '#REF!');
        } else {
            if (eError) {
                console.log('Expense:       ' + '#N/A');
                console.log('Surplus:       ' + '#N/A');
            } else {
                console.log('Expense:       ' + round(Expense, 2));
                console.log('Surplus:       ' + round(Surplus, 2));
            }
        }
    });
 
program.parse(process.argv);

function CalculateCarry() {
    var ctr;
    for (ctr = 0; ctr < tax.length; ctr++) {
        if (ctr > 0) {
            tax[ctr].Carry = (tax[ctr].ULimit - tax[ctr - 1].ULimit) * tax[ctr - 1].Rate + tax[ctr - 1].Carry;
        }
    }
}

function GetTaxRow(Income) {
    var ctr;
    for (ctr = 0; ctr < tax.length; ctr++) {
        if (ctr === tax.length - 1) {
            return ctr;
        }
        else {
            if (tax[ctr + 1].ULimit > Income) {
                return ctr;
            }
        }
    }
}

function GetIncomeBand(Income) {
    var ctr;
    for (ctr = 0; ctr < incomeband.length; ctr++) {
        if (Income <= incomeband[ctr]) {
            return ctr;
        } 
        if (ctr === incomeband.length + 1) {
            return -1;
        }
    }
}

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}