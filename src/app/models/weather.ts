// To parse this data:
//
//   import { Convert, Weather } from "./file";
//
//   const weather = Convert.toWeather(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Weather {
   location: Location;
   current: Current;
}

export interface Current {
   last_updated_epoch: number;
   last_updated: string;
   temp_c: number;
   temp_f: number;
   is_day: number;
   condition: Condition;
   wind_mph: number;
   wind_kph: number;
   wind_degree: number;
   wind_dir: string;
   pressure_mb: number;
   pressure_in: number;
   precip_mm: number;
   precip_in: number;
   humidity: number;
   cloud: number;
   feelslike_c: number;
   feelslike_f: number;
   vis_km: number;
   vis_miles: number;
   uv: number;
   gust_mph: number;
   gust_kph: number;
}

export interface Condition {
   text: string;
   icon: string;
   code: number;
}

export interface Location {
   name: string;
   region: string;
   country: string;
   lat: number;
   lon: number;
   tz_id: string;
   localtime_epoch: number;
   localtime: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
   public static toWeather(json: string): Weather {
      return cast(JSON.parse(json), r("Weather"));
   }

   public static weatherToJson(value: Weather): string {
      return JSON.stringify(uncast(value, r("Weather")), null, 2);
   }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
   if (key) {
      throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
   }
   throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ: any): any {
   if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
      typ.jsonToJS = map;
   }
   return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
   if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
      typ.jsToJSON = map;
   }
   return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
   function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key);
   }

   function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
         const typ = typs[i];
         try {
            return transform(val, typ, getProps);
         } catch (_) { }
      }
      return invalidValue(typs, val);
   }

   function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(cases, val);
   }

   function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val)) return invalidValue("array", val);
      return val.map(el => transform(el, typ, getProps));
   }

   function transformDate(val: any): any {
      if (val === null) {
         return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
         return invalidValue("Date", val);
      }
      return d;
   }

   function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
         return invalidValue("object", val);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach(key => {
         const prop = props[key];
         const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
         result[prop.key] = transform(v, prop.typ, getProps, prop.key);
      });
      Object.getOwnPropertyNames(val).forEach(key => {
         if (!Object.prototype.hasOwnProperty.call(props, key)) {
            result[key] = transform(val[key], additional, getProps, key);
         }
      });
      return result;
   }

   if (typ === "any") return val;
   if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val);
   }
   if (typ === false) return invalidValue(typ, val);
   while (typeof typ === "object" && typ.ref !== undefined) {
      typ = typeMap[typ.ref];
   }
   if (Array.isArray(typ)) return transformEnum(typ, val);
   if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
         : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
               : invalidValue(typ, val);
   }
   // Numbers can be parsed by Date but shouldn't be.
   if (typ === Date && typeof val !== "number") return transformDate(val);
   return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
   return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
   return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
   return { arrayItems: typ };
}

function u(...typs: any[]) {
   return { unionMembers: typs };
}

function o(props: any[], additional: any) {
   return { props, additional };
}

function m(additional: any) {
   return { props: [], additional };
}

function r(name: string) {
   return { ref: name };
}

const typeMap: any = {
   "Weather": o([
      { json: "location", js: "location", typ: r("Location") },
      { json: "current", js: "current", typ: r("Current") },
   ], false),
   "Current": o([
      { json: "last_updated_epoch", js: "last_updated_epoch", typ: 0 },
      { json: "last_updated", js: "last_updated", typ: "" },
      { json: "temp_c", js: "temp_c", typ: 3.14 },
      { json: "temp_f", js: "temp_f", typ: 3.14 },
      { json: "is_day", js: "is_day", typ: 0 },
      { json: "condition", js: "condition", typ: r("Condition") },
      { json: "wind_mph", js: "wind_mph", typ: 3.14 },
      { json: "wind_kph", js: "wind_kph", typ: 3.14 },
      { json: "wind_degree", js: "wind_degree", typ: 0 },
      { json: "wind_dir", js: "wind_dir", typ: "" },
      { json: "pressure_mb", js: "pressure_mb", typ: 0 },
      { json: "pressure_in", js: "pressure_in", typ: 3.14 },
      { json: "precip_mm", js: "precip_mm", typ: 0 },
      { json: "precip_in", js: "precip_in", typ: 0 },
      { json: "humidity", js: "humidity", typ: 0 },
      { json: "cloud", js: "cloud", typ: 0 },
      { json: "feelslike_c", js: "feelslike_c", typ: 3.14 },
      { json: "feelslike_f", js: "feelslike_f", typ: 3.14 },
      { json: "vis_km", js: "vis_km", typ: 0 },
      { json: "vis_miles", js: "vis_miles", typ: 0 },
      { json: "uv", js: "uv", typ: 0 },
      { json: "gust_mph", js: "gust_mph", typ: 3.14 },
      { json: "gust_kph", js: "gust_kph", typ: 3.14 },
   ], false),
   "Condition": o([
      { json: "text", js: "text", typ: "" },
      { json: "icon", js: "icon", typ: "" },
      { json: "code", js: "code", typ: 0 },
   ], false),
   "Location": o([
      { json: "name", js: "name", typ: "" },
      { json: "region", js: "region", typ: "" },
      { json: "country", js: "country", typ: "" },
      { json: "lat", js: "lat", typ: 3.14 },
      { json: "lon", js: "lon", typ: 3.14 },
      { json: "tz_id", js: "tz_id", typ: "" },
      { json: "localtime_epoch", js: "localtime_epoch", typ: 0 },
      { json: "localtime", js: "localtime", typ: "" },
   ], false),
};
