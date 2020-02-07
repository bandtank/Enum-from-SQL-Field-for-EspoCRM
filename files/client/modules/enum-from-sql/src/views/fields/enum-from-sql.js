/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2019 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 * 
 * Enum From SQL - Open source plug in field for EspoCRM
 * Copyright (C) 2019-2020 Omar A Gonsenheim
************************************************************************/

Espo.define('enum-from-sql:views/fields/enum-from-sql', ['views/fields/enum','sql-from-metadata:utils'], function (Dep,ExeMgrUtils) {
    
    return Dep.extend({
        
        setup: function () {
            Dep.prototype.setup.call(this);
            this.listenTo(this.model, 'change', this.setupOptions, this); 
        },

        setupOptions: function () {
            // clear the existing list values and initialize variables
            var list = [];
            var translatedOptions = {};            
            this.params.options = list;
            this.reRender();
            var self = this;
            var goodToGo = true;            
            this.translatedOptions = translatedOptions;
            // get the sql statement building parameters to retrieve the array of options
            var sqlString = this.getMetadata().get('entityDefs.'+this.model.urlRoot+'.fields.'+this.name+'.selectSQL') || '';
            // get the placeholder values to replace in the sqlString
            var placeholders = this.getMetadata().get('entityDefs.'+this.model.urlRoot+'.fields.'+this.name+'.placeholders') || '';
            var payloadPlaceholders = {};
            // convert the placeholder values into javascript expressions
            Object.keys(placeholders).forEach(function(key){     
                // verify that the placeholder attribute is defined
                if(eval("self."+placeholders[key])) {
                    var interpretedItem = eval("self."+placeholders[key]);
                    payloadPlaceholders[key] = ExeMgrUtils.camelCaseToUnderscore(interpretedItem);
                    goodToGo = true;
                } else {
                    goodToGo = false;                    
                }
            });
            if(goodToGo) {
                // prepare and execute Ajax call to retrieve the enum options data
                var options = {};
                options.sqlString = sqlString;     
                options.queryType = "SELECT";
                options.placeholders = payloadPlaceholders;
                var payload = JSON.stringify(options); 
                var url = '?entryPoint=sqlDataDispatcher';            
                this.translatedOptions = null;
                var list = [];
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                        self.wait(false);
                        if (xmlhttp.status === 200) { 
                            if(ExeMgrUtils.isJsonString(xmlhttp.responseText)) {                                
                                var response = JSON.parse(xmlhttp.responseText);  
                                if (Object.keys(response).length > 0) {
                                    translatedOptions[''] = '';
                                    list.push('');
                                    response.forEach(function (item) {
                                        if(item.value) {
                                            list.push(item.value);
                                            if(item.label) {
                                                translatedOptions[item.value] = item.label;
                                            } else {
                                                translatedOptions[item.value] = item.value;                                        
                                            }                                        
                                        }                                    
                                    }, this);
                                    self.translatedOptions = translatedOptions;
                                    self.params.options = list;
                                    self.reRender(); 
                                }  
                            } else {
                                    alert("Invalid Query \n\n"+xmlhttp.responseText);                                                                  
                            }
                        } else if (xmlhttp.status === 400) {
                            alert('There was an error 400');
                        } else {
                            alert('something else other than 200 was returned');
                        }
                    }    
                };            
                xmlhttp.open("POST",url , true);
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");                
                xmlhttp.send("data="+payload);
                self.wait(true);
            }    
        }
        
    });    
});
