

export interface IQueryBuildTree {
    property_identifier: boolean;
    property_identifier_modifying: boolean;
    property_prefix: boolean;
    property_prefix_modifying: boolean;
    property_prefix_name: string;
    property_prefix_uri: string;
    unit: boolean;
    unit_modifying: boolean;
    unit_prefix: boolean;
    unit_prefix_modifying: boolean;
    unit_prefix_name: string;
    unit_prefix_uri: string;
    datatype: boolean;
  }

  export function defaultIQueryBuildTree(): IQueryBuildTree {
    return {
      property_identifier: false,
      property_identifier_modifying: false,
      property_prefix: false,
      property_prefix_modifying: false,
      property_prefix_name: '',
      property_prefix_uri: '',
      unit: false,
      unit_modifying: false,
      unit_prefix: false,
      unit_prefix_modifying: false,
      unit_prefix_name: '',
      unit_prefix_uri: '',
      datatype: false,
    };
  }