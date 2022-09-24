import { Pipe, PipeTransform } from '@angular/core';
import IQuery, { IGeoCircle, IGeoPolygon } from 'src/app/interface/IQuery';

@Pipe({
  name: 'query',
})
export class QueryPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value === 'object') {
      return this.stringifyQuery(value as IQuery);
    } else {
      throw new Error('QueryPipe requires an IQuery input.');
    }
  }

  private stringifyQuery(query: IQuery): string {
    let result = '';

    // Prefix section
    if (query.prefixList && query.prefixList.length > 0) {
      for (const prefix of query.prefixList) {
        result += `PREFIX ${prefix.abbreviation}: <${prefix.completeURI}>\n`;
      }
      result += '\n';
    }

    // Property section
    const { identifier, unit, datatype } = query.property;
    result += `READ ${identifier}\n`;
    result += `UNIT ${unit}\n`;
    result += `TYPE ${datatype}\n`;

    // Filter section
    if (query.staticFilter || query.dynamicFilter || query.geoFilter) {
      result += '\n';

      result += 'FILTER (\n';

      // Static filter section
      if (query.staticFilter) {
        result += `\tSTATIC (${query.staticFilter})\n`;
      }

      // Dynamic filter section
      if (query.dynamicFilter) {
        result += `\tDYNAMIC (${query.dynamicFilter})\n`;
      }

      // Geo filter section
      if (query.geoFilter) {
        result += '\tGEO (\n';

        // Region section
        if (query.geoFilter.region) {
          // Circle region section
          if (
            'center' in query.geoFilter.region &&
            'radius' in query.geoFilter.region
          ) {
            result += '\t\tCIRCLE (\n';

            const circleRegion = query.geoFilter.region as IGeoCircle;
            result += `\t\t\tCENTER (LATITUDE ${circleRegion.center.latitude} LONGITUDE ${circleRegion.center.longitude})\n`;
            result += `\t\t\tRADIUS (VALUE ${circleRegion.radius.value} UNIT ${circleRegion.radius.unit})\n`;

            result += '\t\t)\n';
          } else if (
            'vertices' in query.geoFilter.region &&
            query.geoFilter.region.vertices.length > 3
          ) {
            // Polygon region section
            result += '\t\tPOLYGON (\n';

            const { vertices } = query.geoFilter.region as IGeoPolygon;
            for (const vertex of vertices) {
              result += `\t\t\t(LATITUDE ${vertex.latitude} LONGITUDE ${vertex.longitude})\n`;
            }

            result += '\t\t)\n';
          }
        }

        // Altitude range section
        if (query.geoFilter.altitudeRange) {
          const { min, max, unit } = query.geoFilter.altitudeRange;
          result += `\t\tALTITUDE (MIN ${min} MAX ${max} UNIT ${unit})\n`;
        }

        result += '\t)\n';
      }

      result += ')\n';
    }

    // Time section
    if (query.timeFilter) {
      result += '\n';
      result += 'TIME (\n';

      const { until, interval, aggregation } = query.timeFilter;
      result += `\tUNTIL ${until}\n`;
      result += `\tINTERVAL ${interval}\n`;
      result += `\tAGGREGATION ${aggregation}\n`;

      result += ')\n';
    }

    return result;
  }
}
