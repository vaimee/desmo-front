import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import IQuery, {
  defaultIQuery,
  IPrefix,
  RequestedDataType,
} from 'src/app/interface/IQuery';
import {
  defaultIQueryBuildTree,
  IQueryBuildTree,
} from 'src/app/interface/IQueryBuildTree';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-query-page',
  templateUrl: './query-page.component.html',
  styleUrls: ['./query-page.component.css'],
})
export class QueryPageComponent {
  query: IQuery = defaultIQuery();

  propertyFormGroup: FormGroup = this._fb.group({
    propertyIRI: ['', [Validators.required, this.validIRIValidator()]],
    unitIRI: ['', [Validators.required, this.validIRIValidator()]],
    datatype: [
      RequestedDataType.Integer,
      [Validators.required, Validators.min(0), Validators.max(3)],
    ],
  });
  filtersFormGroup: FormGroup = this._fb.group({
    jsonPathExpression: '',
    dynamicFilterExpression: '',
    geographical: this._fb.group({}),
  });
  prefixesFormArray: FormArray = this._fb.array([]);
  prefixNames: string[] = [];

  constructor(private _fb: FormBuilder) {}

  clearPropertyControl(controlName: string) {
    this.propertyFormGroup.controls[controlName].reset();
  }

  clearFilterControl(controlName: string) {
    this.filtersFormGroup.controls[controlName].reset();
  }

  clearPrefixControl(controlIndex: number = -1) {
    if (controlIndex >= 0 && controlIndex < this.prefixesFormArray.length) {
      this.prefixesFormArray.controls[controlIndex].reset();
    }
    throw new Error('Index out-of-bounds for the prefixesFormArray!');
  }

  getPrefixControl(index: number = -1): FormControl {
    if (index >= 0 && index < this.prefixesFormArray.length) {
      return this.prefixesFormArray.controls[index] as FormControl;
    }
    throw new Error('Index out-of-bounds for the prefixesFormArray!');
  }

  submitQuery() {
    this.query = defaultIQuery();

    // Prefix list
    for (let i = 0; i < this.prefixesFormArray.length; ++i) {
      this.query.prefixList?.push({
        abbreviation: this.prefixNames[i],
        completeURI: this.prefixesFormArray.controls[i].value,
      });
    }

    // Property
    this.query.property.identifier = this.propertyFormGroup.value.propertyIRI;
    this.query.property.unit = this.propertyFormGroup.value.unitIRI;
    this.query.property.datatype = this.propertyFormGroup.value.datatype;

    // Filters
    this.query.staticFilter = this.filtersFormGroup.value.jsonPathExpression;
    this.query.dynamicFilter = this.filtersFormGroup.value.dynamicFilterExpression;

    // TODO: other parts of the query...
    console.log(this.query);
  }

  resetQueryBuilder(stepperObject: MatStepper) {
    stepperObject.reset(); // All the controls are set to null
    // The datatype must be either 0, 1, 2 or 3 (not null!)
    this.propertyFormGroup.controls['datatype'].setValue(
      RequestedDataType.Integer
    );
  }

  handlePrefixes(event: StepperSelectionEvent) {
    if (event.selectedIndex == 2) {
      // User selected the final step:
      const prefixes = new Set<string>();
      const IRIs = [
        this.propertyFormGroup.value.propertyIRI,
        this.propertyFormGroup.value.unitIRI,
      ];

      for (const iri of IRIs) {
        const prefix = this.getPrefix(iri);
        if (prefix !== null) prefixes.add(prefix);
      }

      this.prefixesFormArray.clear();
      this.prefixNames = [];
      for (const prefix of prefixes) {
        this.prefixesFormArray.push(
          this._fb.control('', [Validators.required, this.httpUrlValidator()])
        );
        this.prefixNames.push(prefix);
      }
    }
  }

  private getPrefix(data: string): string | null {
    data = data.trim();
    // if it's an URL, it's valid
    //check if it is a valid URI
    if (this.isValidHttpUrl(data)) {
      return null;
    }
    const slices: string[] = data.split(':') as string[];
    if (slices.length == 2) {
      return slices[0];
    }
    return null;
  }

  private isValidHttpUrl(string: string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  private validIRIValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const IRIString = control.value as string;
      if (this.isValidHttpUrl(IRIString)) {
        return null;
      }

      const semicolonIndex = IRIString.indexOf(':');
      if (semicolonIndex >= 0) {
        return null;
      }
      return { invalidIRI: { value: control.value } };
    };
  }

  private httpUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const IRIString = control.value as string;

      if (
        this.isValidHttpUrl(IRIString) &&
        (IRIString.endsWith('#') || IRIString.endsWith('/'))
      ) {
        return null;
      }
      return { invalidHttpUrl: { value: control.value } };
    };
  }
}
