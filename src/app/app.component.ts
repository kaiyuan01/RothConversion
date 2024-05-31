import { Component, Input, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule} from '@angular/forms';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {MatTableModule} from '@angular/material/table';
import { TableDataService } from './services/table-data.service';

export interface ColData {
  year: number;
  age: number;
  bal: number;
  income: number;
  ded: number;
  conversion: number;
  taxableIncome: number;
  rmdFactor: number;
  rmdAmt: number;
  taxBracket1: number;
  taxBracket2: number;
  taxBracket3: number;
  tax: number;
  balAftTax: number;
}

export interface ColDataSummary {
  info: string;
  at80: string;
  at100: string;
  at120: string;
}

let ELEMENT_DATA: ColData[] = [
  {year: 2024, age: 7, bal: 20.1797, income: 23000, ded: 0,
    conversion: 0,
    taxableIncome: 0,
    rmdFactor: 0,
    rmdAmt: 0,
    taxBracket1: 0,
    taxBracket2: 0,
    taxBracket3: 0,
    tax: 0,
    balAftTax: 0,
   },
];

let ELEMENT_DATA_SUMMARY: ColDataSummary[] = [
  {info: '', at80: '', at100: '', at120: '',}];
   
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatTableModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers:[TableDataService]
})


export class AppComponent implements OnInit  {
 // @Input() columns: [] = []; //TableHeader
 // @Input() data: [] | null = [];

  dataSummary: ColDataSummary[] = ELEMENT_DATA_SUMMARY;
  newSummary: ColDataSummary = {info: '', at80: '', at100: '', at120: '',};
  constructor(private myService: TableDataService) {
    this.dataSummary = myService.getSummary();
  }
  addItem() {
    this.myService.addSummary(this.newSummary);
    //this.newItem = '';
  }

  displayedColumns: string[] = ['year', 'age', 'bal', 'income', 'ded',
    'conversion',
    'taxableIncome',
    'rmdFactor',
    'rmdAmt',
    'taxBracket1', 'taxBracket2','taxBracket3','tax', 'balAftTax'];

  displayedColumnsSummary: string[] = ['info', 'at80', 'at100', 'at120',];
  dataSource = ELEMENT_DATA;
  summary = ELEMENT_DATA_SUMMARY; //this.myService.getSummary(); //this.dataSummary; //ELEMENT_DATA_SUMMARY;
  
  title = 'Roth Conversion Planner';

  INIT_DED = '29,200';
  INIT_BAL = '1000000';
  INIT_RET = '10%';
  INIT_INC = '16,338';
  INIT_TB = '22%';


  myForm : FormGroup = new FormGroup({
    bal: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });;

  ngOnInit() {
    this.myForm = new FormGroup({
      bal: new FormControl(this.INIT_BAL, Validators.required),
      return: new FormControl(this.INIT_RET, [Validators.required]),
      age: new FormControl('', Validators.required),
      age2convert: new FormControl('62', Validators.required),
      
      income: new FormControl(this.INIT_INC, [Validators.required]),
      deductible: new FormControl(this.INIT_DED, [Validators.required]),
      conversion: new FormControl('', Validators.required),
      taxableIncome: new FormControl('', Validators.required),
      taxableIncome2: new FormControl('', Validators.required),
      taxBracket: new FormControl(this.INIT_TB, Validators.required),
    });
  }

  onSubmit() {
    console.log(this.myForm.value);
    if(this.myForm && this.myForm.get('taxBracket') && this.myForm.get('taxBracket')?.value == "22%") {
      this.myForm.get("taxableIncome")?.setValue( '201050' );

      console.log( 'taxableIncome: ', this.myForm.get('taxableIncome')?.value );
      console.log( 'income: ', parseInt(this.myForm.get("income")?.value.replace(/,/g, ''), 10) );

      let conversion = this.myForm.get('taxableIncome')?.value 
        - parseInt(this.myForm.get("income")?.value.replace(/,/g, ''), 10)  
        + parseInt(this.myForm.get("deductible")?.value.replace(/,/g, ''), 10);
      console.log("conversion: ", conversion);

      this.myForm.get("conversion")?.setValue( conversion );
      
      // populate table data
      this.dataSource = [];
      this.summary = [];

      /* let row =
        {year: 2024, age: 56, bal: 1042697, income: 23000, ded: 0,
          conversion: 0, taxableIncome: 0,
          rmdFactor: 0, rmdAmt: 0,
          taxBracket1: 0, taxBracket2: 0, tax: 0
         };   
      this.dataSource.push(row);
      */

      let counter = 1;

      let age = parseInt(this.myForm.get("age")?.value.replace(/,/g, ''), 10);
      let age2convert = parseInt(this.myForm.get("age2convert")?.value.replace(/,/g, ''), 10);

      let year = (new Date()).getFullYear();
      let bal = parseFloat(this.myForm.get("bal")?.value.replace(/,/g, ''));
      let ret = parseFloat(this.myForm.get("return")?.value.replace(/,/g, '')) / 100;
      let ded = parseFloat(this.myForm.get("deductible")?.value.replace(/,/g, ''));
      let taxableIncome = parseFloat(this.myForm.get("taxableIncome")?.value.replace(/,/g, ''));
      let income = parseFloat(this.myForm.get("income")?.value.replace(/,/g, ''));
      let tax1 = 2320.0, tax2 = 8532.0, tax3 = 23485;
      let tax = tax1 + tax2 + tax3;
      //conversion = taxableIncome-income+ded;

      let taxTot = tax;
      if(this.summary.at(0)?.info === '') {
        //this.summary = [];
      }

      let rowSummary = 
      {
        info: 'Starting with $' + bal +' at ' + age + '; start converting to Roth at age ' + age2convert,
        at80: '0',
        at100: '0',
        at120: '0',
      };   

      let row =
         {year: year, age: age, bal: bal, income: income, ded: ded,
          conversion: conversion, taxableIncome: taxableIncome,
          rmdFactor: 0, rmdAmt: 0,
          taxBracket1: tax1, taxBracket2: tax2, taxBracket3: tax3, tax: tax, balAftTax: conversion-tax
         };   

      if(age < age2convert) {
          row['conversion'] = 0;
          row['taxBracket1'] = 0;
          row['taxBracket2'] = 0;
          row['taxBracket3'] = 0;
          row['tax'] = 0;
          row['balAftTax'] = 0;
          //row['bal'] = row['bal'] * (1 + ret);
       }
       
      this.dataSource.push(row);

      while (age < 120) {
        //console.log(counter);
        age++;
        year++;

        bal = row['bal'];
        //console.log('ret=', ret, ', bal=',bal);
        taxableIncome = row['taxableIncome'];
        income = row['income'];
        ded = row['ded'];
        conversion = row['conversion'];
        let conversion2 = taxableIncome-income+ded;

        let balAftTax = row['balAftTax'];

        let bal2 =  bal * (1 + ret) - conversion2;
        row = 
        {year: year, age: age, bal: bal2 >=0 ? bal2 : 0, income: income, ded: ded,
          conversion: conversion2, taxableIncome: taxableIncome,
          rmdFactor: 0, rmdAmt: 0,
          taxBracket1: tax1, taxBracket2: tax2, taxBracket3: tax3, tax: tax1+tax2+tax3,
          balAftTax: balAftTax*(1+ret) + conversion2 - tax,
         };   

         if(bal2 <= 0 || bal ==0) {
            row['taxBracket1'] = 0;
            row['taxBracket2'] = 0;
            row['taxBracket3'] = 0;
            row['tax'] = 0;
            
            if (bal ==0 || (bal-conversion) <=0 ) { // last year's conversion amt
              // prev/orig bal is 0, account has no bal left
              row['conversion'] = 0;
              row['bal'] = 0;
              row['balAftTax'] = balAftTax * (1 + ret);
            }
         }
         if(age < age2convert) {
            row['conversion'] = 0;
            row['taxBracket1'] = 0;
            row['taxBracket2'] = 0;
            row['taxBracket3'] = 0;
            row['tax'] = 0;
            row['balAftTax'] = 0;
            row['bal'] = bal * (1 + ret);
         }
         /*else if(age == age2convert) {
            row['bal'] = bal * (1 + ret);
         }*/

         this.dataSource.push(row);
         taxTot += row['tax'];

         if(age == 80) {
            rowSummary['at80'] = 'balAftTax: ' + (row['balAftTax'].toLocaleString('en-US', { style: 'currency', currency: 'USD',maximumFractionDigits: 2 }));
         }
         else if(age == 100) {
            rowSummary['at100'] = 'balAftTax: ' + row['balAftTax'].toLocaleString('en-US', { style: 'currency', currency: 'USD',maximumFractionDigits: 2 }).toString();
         }
         else if(age == 120) {
            rowSummary['at120'] = 'balAftTax: ' + row['balAftTax'].toLocaleString('en-US', { style: 'currency', currency: 'USD',maximumFractionDigits: 2 }).toString() +
                                  '\nAllTaxPaid: ' + taxTot;
            this.myService.addSummary(rowSummary);
            //this.dataSummary.push(rowSummary);
            //this.summary = this.myService.getSummary();
            this.summary.push(rowSummary);
            //this.summary.push(rowSummary);

            //this.dataSummary.push(rowSummary);
            console.log('this.dataSummary: ', this.dataSummary);
            //console.log('this.dataSource: ', this.dataSource);
            this.summary = [];
            // clone the array
            this.dataSummary.forEach(val => this.summary.push(Object.assign({}, val)));
            console.log('this.summary: ', this.summary);
         }

         counter++;
      }
    }

    // if the data in the table got changed
    if(1  && this.myForm && this.myForm.get('taxableIncome2')?.dirty ) {
      console.log( 'taxableIncome2: ', this.myForm.get('taxableIncome2')?.value );
      //this.myForm.get("taxableIncome")?.setValue( '999' );

      this.myForm.get("taxableIncome")?.setValue( this.myForm.get('taxableIncome2')?.value );
    }
  }


}
