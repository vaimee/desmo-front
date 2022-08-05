import { IGeoAltitudeRange } from './../../interface/IQuery';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { Component } from '@angular/core';
import IQuery, {
  defaultIQuery,
  IGeoPosition,
  RequestedDataType,
} from 'src/app/interface/IQuery';

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
import { Map as MapboxMap } from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MatRadioChange } from '@angular/material/radio';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

let filterMap: MapboxMap;
const drawPolygon: MapboxDraw = new MapboxDraw({
  displayControlsDefault: false,
  // Select which mapbox-gl-draw control buttons to add to the map.
  controls: {
    polygon: true,
    trash: true,
  },
  // Set mapbox-gl-draw to draw by default.
  // The user does not have to click the polygon control button first.
  defaultMode: 'draw_polygon',
});

@Component({
  selector: 'app-query-page',
  templateUrl: './query-page.component.html',
  styleUrls: ['./query-page.component.css'],
})
export class QueryPageComponent {
  query: IQuery = defaultIQuery();

  propertyFormGroup: FormGroup = this._fb.group({
    // propertyIRI: ['', [Validators.required, this.validIRIValidator()]],
    propertyIRI: ['', [Validators.required]],
    unitIRI: ['', [Validators.required, this.validIRIValidator()]],
    datatype: [
      RequestedDataType.Integer,
      [Validators.required, Validators.min(0), Validators.max(3)],
    ],
  });
  filtersFormGroup: FormGroup = this._fb.group(
    {
      jsonPathExpression: '',
      dynamicFilterExpression: '',
      geoAltitudeLimits: this._fb.group({ hasMin: false, hasMax: false }),
      geoAltitudeRange: this._fb.group({
        min: [0, [Validators.min(0), Validators.max(10000)]],
        max: [0, [Validators.min(0), Validators.max(10000)]],
      }),
      geoType: 'none',
    },
    { validators: this.maxGreaterThanMin }
  );
  prefixesFormArray: FormArray = this._fb.array([]);
  prefixNames: string[] = [];

  constructor(private _fb: FormBuilder, private desmold: DesmoldSDKService) {}

  onFilterMapLoad(map: MapboxMap): void {
    filterMap = map;
    map.addControl(drawPolygon);
    map.on('draw.create', (event: any) => {
      const data = drawPolygon.getAll();
      if (event.type === 'draw.create') {
        if (data.features.length > 1) {
          alert('ERROR: you cannot create more than one polygon!');
          for (let i = 1; i < data.features.length; ++i) {
            if (data.features[i].id !== undefined) {
              drawPolygon.delete(data.features[i].id!.toString());
            }
          }
        }
      }
    });
  }

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

  isSelectedGeoTypeNone(): boolean {
    return this.filtersFormGroup.value.geoType === 'none';
  }

  async submitQuery() {
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

    // Query filters
    this.query.staticFilter = this.filtersFormGroup.value.jsonPathExpression;
    this.query.dynamicFilter =
      this.filtersFormGroup.value.dynamicFilterExpression;

    // GEO filter
    // Altitude range
    const {hasMin, hasMax} = this.filtersFormGroup.value.geoAltitudeLimits;
    const altitudeBounds = this.filtersFormGroup.value.geoAltitudeRange;
    if (hasMin || hasMax) {
      this.query.geoFilter!.altitudeRange = {} as IGeoAltitudeRange;
      if (hasMin) {
        this.query.geoFilter!.altitudeRange!.min = altitudeBounds.min;
      }
      if (hasMax) {
        this.query.geoFilter!.altitudeRange!.max = altitudeBounds.max;
      }
      this.query.geoFilter!.altitudeRange!.unit = "https://qudt.org/vocab/unit/M";
    }
    // Region
    const geoRegionType: string = this.filtersFormGroup.value.geoType;
    if (geoRegionType === 'polygon') {
      const vertices = (drawPolygon.getAll().features[0].geometry as any)
        .coordinates[0];
      // For a polygon to be well-defined, it must contain
      // at least 3 vertices + 1 (the first one repeated at the end):
      if (vertices.length >= 4) {
        this.query.geoFilter!.region = { vertices: [] };
        for (const vertex of vertices) {
          const curVertex: IGeoPosition = {
            longitude: vertex[0],
            latitude: vertex[1],
          };
          this.query.geoFilter!.region.vertices.push(curVertex);
        }
      }
    } else if (geoRegionType === 'circle') {
      // TODO
    }

    // TODO: other parts of the query...
    console.log(this.query);
    this.desmold.connect();

    const eventPromise = firstValueFrom(this.desmold.desmoHub.requestID$);
    await this.desmold.desmoHub.getNewRequestID();
    const event = await eventPromise;

    await this.desmold.desmoContract.buyQuery(event.requestID, JSON.stringify(this.query), environment.iExecDAppAddress);
  }

  resetQueryBuilder(stepperObject: MatStepper) {
    stepperObject.reset(); // All the controls are set to null

    // The datatype must be either 0, 1, 2 or 3
    this.propertyFormGroup.controls['datatype'].setValue(
      RequestedDataType.Integer
    );

    // The geoType must be either 'none', 'polygon' or 'circle'
    this.filtersFormGroup.controls['geoType'].setValue('none');

    this.filtersFormGroup.get('geoAltitudeRange.min')?.setValue(0);
    this.filtersFormGroup.get('geoAltitudeRange.max')?.setValue(0);
  }

  handlePrefixes(event: StepperSelectionEvent) {
    if (event.selectedIndex === 4) {
      // Collect prefixes used by the user:
      const prefixes = new Set<string>();
      const IRIs = [
        this.propertyFormGroup.value.propertyIRI,
        this.propertyFormGroup.value.unitIRI,
      ];
      for (const iri of IRIs) {
        const prefix = this.getPrefix(iri);
        if (prefix !== null) prefixes.add(prefix);
      }

      // Prefixes to be removed:
      const prefixesToBeRemoved = new Set<string>(
        this.prefixNames.filter((x) => !prefixes.has(x))
      );
      for (const prefix of prefixesToBeRemoved) {
        const prefixIndex = this.prefixNames.indexOf(prefix);
        this.prefixesFormArray.removeAt(prefixIndex);
        this.prefixNames.splice(prefixIndex, 1);
      }

      // Prefixes to be added:
      const prefixesToBeAdded = new Set<string>(
        [...prefixes].filter((x) => !this.prefixNames.includes(x))
      );
      for (const prefix of prefixesToBeAdded) {
        this.prefixesFormArray.push(
          this._fb.control('', [Validators.required, this.httpUrlValidator()])
        );
        this.prefixNames.push(prefix);
      }
    }
  }

  public handleGeoTypeChanged(event: MatRadioChange) {
    if (event.value === 'none') {
    } else if (event.value === 'polygon') {
    } else if (event.value === 'circle') {
      alert('ERROR: unimplemented feature!');
      this.filtersFormGroup.controls['geoType'].setValue('none');
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
      if (control.value !== null) {
        const IRIString = control.value as string;
        if (this.isValidHttpUrl(IRIString)) {
          return null;
        }

        const semicolonIndex = IRIString.indexOf(':');
        if (semicolonIndex >= 0) {
          return null;
        }
      }
      return { invalidIRI: { value: control.value } };
    };
  }

  private httpUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value !== null) {
        const IRIString = control.value as string;

        if (
          this.isValidHttpUrl(IRIString) &&
          (IRIString.endsWith('#') || IRIString.endsWith('/'))
        ) {
          return null;
        }
      }
      return { invalidHttpUrl: { value: control.value } };
    };
  }

  private maxGreaterThanMin(control: AbstractControl): ValidationErrors | null {
    const hasMin = control.get('geoAltitudeLimits.hasMin')?.value;
    const hasMax = control.get('geoAltitudeLimits.hasMax')?.value;
    const min = control.get('geoAltitudeRange.min')?.value;
    const max = control.get('geoAltitudeRange.max')?.value;
    if (hasMin && hasMax && min !== null && max !== null) {
      if (min >= max) {
        return { maxGreaterThanMin: true };
      }
    }

    return null;
  }
}
