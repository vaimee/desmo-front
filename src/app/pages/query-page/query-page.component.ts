import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import IQuery, { defaultIQuery, IPrefix, RequestedDataType } from 'src/app/src/interface/IQuery';
import { defaultIQueryBuildTree, IQueryBuildTree } from 'src/app/src/interface/IQueryBuildTree';
import { IQueryTreeState } from 'src/app/src/interface/IQueryTreeState';



@Component({
  selector: 'app-query-page',
  templateUrl: './query-page.component.html',
  styleUrls: ['./query-page.component.css']
})
export class QueryPageComponent {
  
  new_query = true;
  sendQueryButtonDisabled: boolean = true;
  query: IQuery = defaultIQuery();
  query_tree : IQueryBuildTree = defaultIQueryBuildTree();


  build_new_query_click(): void {
    this.new_query = false;
    this.query_tree.property_identifier = true;
    this.query_tree.property_identifier_modifying = true;
    
  }
  query_property_clear_click(): void {
    this.query_tree.property_identifier = false;
    this.query_tree.property_identifier_modifying = false;
    this.new_query = true;
    this.query = defaultIQuery();
    this.query_tree = defaultIQueryBuildTree();
  }
  query_property_done_click():void {
    const hasPrefixProperty : [boolean, string]= this.hasPrefix(this.query.property.identifier);
    if (hasPrefixProperty[0]) {
    this.query_tree.property_prefix = true;
    this.query_tree.property_prefix_name = hasPrefixProperty[1];
    this.query_tree.property_prefix_modifying = true;
    const prefix: IPrefix = {abbreviation: this.query_tree.property_prefix_name, completeURI: hasPrefixProperty[1]};
    }
    else {
      this.query_tree.property_identifier_modifying = false;
      this.query_tree.unit = true;
      this.query_tree.unit_modifying= true;
    }
    this.query_tree.property_identifier_modifying = false;

  }
  query_property_edit_click(): void {
    const propertyValue = this.query.property.identifier;
    this.query = defaultIQuery();
    this.query.property.identifier = propertyValue;
    this.query_tree = defaultIQueryBuildTree();
    this.query_tree.property_identifier = true;
    this.query_tree.property_identifier_modifying = true;
    // delete from query.prefixList the prefix that has as abbreviation the same as query_tree.property_prefix_name
    this.query.prefixList = this.query?.prefixList?.filter(prefix => prefix.abbreviation !== this.query_tree.property_prefix_name);
  }
//query property prefix logic

  query_property_prefix_clear_click(): void {
    this.query_tree.property_prefix = false;
    this.query_tree.property_prefix_modifying= false;
    this.query_tree.property_identifier_modifying = true;
  }
  query_property_prefix_done_click():void {
    this.query_tree.property_prefix_modifying = false;
    this.query_tree.unit = true;

  }
  query_property_prefix_edit_click(): void {
    this.query_tree.property_prefix_modifying = true;
    this.query_tree.unit = false;
    this.query_tree.unit_modifying = false;
    this.query.property.unit = '';
  }

  //query unit logic
  query_unit_clear_click(): void {
    this.query_tree.unit = false;
    this.query_tree.unit_modifying = false;
    if (this.query_tree.property_prefix==true){
      this.query_tree.property_prefix_modifying = true;
    }
    else {
      this.query_tree.property_identifier_modifying = true;
    }
  }
  query_unit_done_click():void {
    const hasPrefixProperty : [boolean, string]= this.hasPrefix(this.query.property.unit);
    this.query_tree.unit_modifying = false;
    if (hasPrefixProperty[0]) {
    this.query_tree.unit_prefix = true;
    this.query_tree.unit_prefix_name = hasPrefixProperty[1];
    this.query_tree.unit_prefix_modifying = true;
    const prefix: IPrefix = {abbreviation: this.query_tree.unit_prefix_name, completeURI: hasPrefixProperty[1]};
    this.query?.prefixList?.push(prefix);
  }
    else {
      this.query_tree.unit_prefix = false;
      this.query_tree.unit_prefix_modifying = false;
      this.query_tree.datatype = true;
    }

  }
  query_unit_edit_click(): void {
    this.query_tree.unit_modifying = true; 
    this.query_tree.unit_prefix = false;
    this.query_tree.unit_prefix_modifying = false;
    this.query_tree.datatype = false;
    // delete from query.prefixList the prefix that has as abbreviation the same as query_tree.unit_prefix_name
    this.query.prefixList = this.query?.prefixList?.filter(prefix => prefix.abbreviation !== this.query_tree.unit_prefix_name);
    
  }
  //query unit prefix logic
  query_unit_prefix_clear_click(): void {
    this.query_tree.unit_prefix = false;
    this.query_tree.unit_prefix_modifying= false;
    this.query_tree.unit_modifying = true;
  }
  query_unit_prefix_done_click():void {
    this.query_tree.unit_prefix_modifying = false;
    this.query_tree.datatype = true;
  }
  query_unit_prefix_edit_click(): void {
    this.query_tree.unit_prefix_modifying = true;
    this.query_tree.datatype = false;
    this.query.property.datatype = RequestedDataType.String;
  }
  //query datatype logic
  


  hasPrefix (data: string): [boolean, string] {
    data = data.trim();
    // if it's an URL, it's valid
    //check if it is a valid URI
    if (this.isValidHttpUrl(data)) {
        return [false, ''];
    }
    const slices: string[] = data.split(":") as string[];
    if (slices.length == 2) {
       return [true, slices[0]];

     }
    return [false, ''];
  }

isValidHttpUrl(string: string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

}