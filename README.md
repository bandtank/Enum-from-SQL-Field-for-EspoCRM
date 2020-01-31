# Enum-from-SQL-Field-for-EspoCRM
Enum type field that can be populated by custom SQL statements specified in metadata 

Usage instructions:

Go to Administration >> Entity Manager and select your target Entity, then click the Fields link.
Click "Add Field" and select "Enum from SQL".
Clear cache and rebuild.

To specify the SQL statement and optional placeholders go to the target Entity entityDefs JSON file and follow the example below: 

The sample entity contains two select (enum) elements, one called "entityType" and the second one called "entitySubType". 

Enum "entityType" contains a list of all entities defined in Espo.

When an entity is chosen from the entity list, Enum "entitySubType" will be populated with the various values of the field "type" found in all existing records of that entity.

When a user selects a different entity in Enum "entityType", "entitySubType" will be re-populated


"fields": {

"entityType": {

   "type": "enum",
	 
   "required": true,
	 
   "translation": "Global.scopeNames",
	 
   "view": "views/fields/entity-type"
	 
   },
   
   "entitySubType": {
	 
      "type": "enum-from-sql",
			
      "required": true,
			
      "options": [],
			
      "isCustom": true,
			
      "selectSQL": "SELECT type AS value FROM @@{{entityType}}/@@ GROUP BY type",
			
      "placeholders":{
			
         "entityType":"model.attributes.entityType"
				 
       }
			 
   }  
	 
}   
