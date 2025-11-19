
/** @typedef {(
 *      "string"
 *      | "number"
 *      | "boolean"
 *      | "object"
 *      | "function"
 *      | "undefined"
 *      | {
 *          schematype: "object",
 *          subschema: { [requiredKey: string | number]: ExpectedSchemaType }
 *          subschemaKeyPatterns?: { keyMatcher: ((key: string | number) => boolean), valueSchema: ExpectedSchemaType }[]
 *      }
 *      | {
 *          schematype: "union",
 *          anyof: ExpectedSchemaType[]
 *      }
 *      | {
 *          schematype: "array",
 *          subschema: ExpectedSchemaType
 *      }
 *      | {
 *          schematype: "literal",
 *          value: string | number | boolean
 *      }
 *      | "any"
 *      | null
 * )} ExpectedSchemaType */

/**
 * @param {any} inputObj 
 * @param {ExpectedSchemaType} expectedSchema 
 * @returns boolean
 */
export function matchAgainstSchema(inputObj, expectedSchema) {

    let _entireObjMatchesExpectedSchema = true;
    
    /** @type {{
     *      obj: any,
     *      schema: ExpectedSchemaType,
     *      unionTrackingObj?: { uncheckedOptionsCt: 0 },
     * }[]} */
    let _objQueueStack = [
        { obj: inputObj, schema: expectedSchema }
    ];
    
    while (_entireObjMatchesExpectedSchema && _objQueueStack.length > 0) {
        let thisObjPassed = true;
        const popped = /** @type {_objQueueStack[number]} */(_objQueueStack.pop());
        const { obj, schema } = popped;
        // check obj against schema
        if(schema === "any") {
            // the schema does not specify a required value type for this key; the obj passes
        }
        else if(typeof schema === "string") {
            if(typeof obj !== schema) {
                thisObjPassed = false;
            }
        }
        else if(schema === null) {
            if(obj !== null) {
                thisObjPassed = false;
            }
        }
        else if(typeof schema === "object") {
            if(schema.schematype === "literal") {
                if(obj !== schema.value) {
                    thisObjPassed = false;
                }
            }
            else if(schema.schematype === "object") {
                if(typeof obj !== "object") {
                    thisObjPassed = false;
                }
                else {
                    const objKeysToCheck = new Set(Object.keys(obj));

                    // check all required key-value pairs of obj
                    for(const schemaReqKey of Object.keys(schema.subschema)) {
                        if(!Object.hasOwn(obj, schemaReqKey)) {
                            thisObjPassed = false;
                            break;
                        }
                        const schemaValType = schema.subschema[schemaReqKey];
                        const objVal = obj[schemaReqKey];
                        objKeysToCheck.delete(schemaReqKey);

                        // recursion: queue up the objVal as another object to check the schema of.
                        _objQueueStack.push({ obj: objVal, schema: schemaValType });
                    }

                    if(schema.subschemaKeyPatterns) {
                        // check all other key-value pairs of obj in case they match a patterned key schema
                        for(const remainingKeyOfObj of objKeysToCheck) {
                            for(const { keyMatcher, valueSchema } of schema.subschemaKeyPatterns) {
                                if(!keyMatcher(remainingKeyOfObj)) {
                                    // this objKey does not match this pattern; keep checking other patterns.
                                    continue;
                                }
                                const objVal = obj[remainingKeyOfObj];
                                // recursion: queue up the objVal as another object to check the schema of.
                                _objQueueStack.push({ obj: objVal, schema: valueSchema });
                            }
                        }
                    }

                    // the obj itself (but not necessarily its children) passes this schema check
                }
            }
            else if(schema.schematype === "array") {
                if(!Array.isArray(obj)) {
                    thisObjPassed = false;
                    break;
                }
                else {
                    // check all children of array obj
                    for(const child of obj) {
                        // recursion: queue up the child as another object to check the schema of.
                        _objQueueStack.push({ obj: child, schema: schema.subschema });
                    }

                    // the obj itself (but not necessarily its children) passes this schema check
                }
            }
            else if(schema.schematype === "union") {
                if(schema.anyof.length <= 0) {
                    console.warn("specified schema union did not have any sub-schemas specified inside schema.anyof. Treating like `never` and failing the schema check.");
                    thisObjPassed = false;
                }
                else {
                    const sharedCtTrackingObject = { uncheckedOptionsCt: schema.anyof.length }
                    for(const schemaOption of schema.anyof) {
                        // recursion: queue up the object with each possible option to check
                        _objQueueStack.push({ obj: obj, schema: schemaOption, unionTrackingObj: sharedCtTrackingObject });
                    }

                    // for now the obj is passing the schema check
                }
            }
            else {
                console.error("schema: ", schema);
                throw new Error(`Unexpected specified complex schema; schema: ${schema}`);
            }
        }
        else {
            console.error("schema: ", schema);
            throw new Error(`Unexpected specified schema: ${schema}`);
        }

        if(!thisObjPassed) {
            // This schema check didn't pass. Consider whether this means the whole check has failed.

            if(typeof popped.unionTrackingObj === "object") {
                // it was part of a union
                // decrease the amount left to check in that union (this is a shared object amongst all the union members)
                popped.unionTrackingObj.uncheckedOptionsCt -= 1
                if(popped.unionTrackingObj.uncheckedOptionsCt <= 0) {
                    // if we have checked them all, and all failed, then the whole union failed.
                    _entireObjMatchesExpectedSchema = false;
                }
                // else continue; just because one part of the union failed does not mean the whole union failed.
            }
            else {
                _entireObjMatchesExpectedSchema = false;
            }
        }
    }

    return _entireObjMatchesExpectedSchema;
}

export class schemautils {
    /**
     * @param {NonNullable<Extract<ExpectedSchemaType, {schematype: "object"}>["subschemaKeyPatterns"]>[number]["valueSchema"]} valueSchema
     * @returns {ExpectedSchemaType} 
     */
    static objectAnyKey(valueSchema) {
        return {
            schematype: "object",
            subschema: { },
            subschemaKeyPatterns: [
                {
                    keyMatcher: () => true,
                    valueSchema: valueSchema
                }
            ]
        };
    }

    /**
     * @param {Extract<ExpectedSchemaType, {schematype: "array"}>["subschema"]} subschema
     * @returns {ExpectedSchemaType} 
     */
    static array(subschema) {
        return {
            schematype: "array",
            subschema: subschema
        };
    }

    /**
     * @param {(
     *      Extract<ExpectedSchemaType, {schematype: "union"}>["anyof"][number]
     *      | Extract<ExpectedSchemaType, {schematype: "union"}>["anyof"]
     * )} possibility 
     * @param {...(
     *      Extract<ExpectedSchemaType, {schematype: "union"}>["anyof"][number]
     *      | Extract<ExpectedSchemaType, {schematype: "union"}>["anyof"]
     * )} others 
     * @returns {ExpectedSchemaType} 
     */
    static union(possibility, ...others) {
        /** @type {Extract<ExpectedSchemaType, {schematype: "union"}>["anyof"]} */
        let anyof = [];
        if(Array.isArray(possibility))
            anyof.push(...possibility);
        else
            anyof.push(possibility);
        for(const possibility of others) {
            if(Array.isArray(possibility))
                anyof.push(...possibility);
            else
                anyof.push(possibility);
        }
        return {
            schematype: "union",
            anyof: anyof
        };
    }
}

/** @type {ExpectedSchemaType} */
export const _schema_Vec2 = {
    schematype: "object",
    subschema: { "x": "number", "y": "number" }
};

/** @type {ExpectedSchemaType} */
export const _schema_MapType = {
    schematype: "union",
    anyof: Object.values(MapType).map(v => ({ schematype: "literal", value: v }))
};