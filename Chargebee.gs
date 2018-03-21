/**
 * Apps Script library to query ChargeBee's API
 * Works (mostly) with ChargeBee API V2
 *
 * Use getChargebee custom function to query Chargebee API from within Google Spreadsheet
 * i.e. =getChargebee("addons";"params";"key_Value";CB_Addon();SUBDOMAIN;API_KEY)
 *
 * @author Greg Lopez
 * @version 0.4
 */

/**
* Retourne une liste de n'importe quel élément de Chargebee donné en paramètre
*
* @param {string} object       - The kind of object you are expecting from API (i.e. "addons", "invoices", "customers", subscriptions ...)
* @param {string} params       - A string of parameters as discribed here https://apidocs.chargebee.com/docs/api#pagination_and_filtering
* @param {string} key          - When request nested objects, the key allows you to pick them up (i.e. object= Invoices & key=Line items. 
* @param {Array}  objectFields - When request nested objects, the key allows you to pick them up (i.e. object= Invoices & key=Line items. 
* @param {string} subdomain    - Chargebee's subdomain
* @param {string} token        - Chargebee's API Key
* @return An array of Chargebee's objects
* @customfunction
**/
function getChargebee(object, params, key, objectFields, subdomain, token){
  // objects are plural in Chargebee's API
  var objects = object+"s"
  // the result that is going to be displayed
  var result = new Array()
  // the raw elements from Chargebee's API
  var elements = getChargebeeElements(objects,params,subdomain,token)
  
  elements.forEach(function (elem) {
    if (!key) {
      result.push(formatChargebeeObject(objectFields)(elem[object]))
    } 
    // if a nested key is given, return the nested objects 
    else {
      elem[object][key].forEach(function(obj) {
        result.push(formatChargebeeObject(objectFields)(obj))
      })
    }
  })
  return result
}

/**
* Retourne une liste d'élément d'un type d'object donné
*
* @param {string} object       - The kind of object you are expecting from API (i.e. "addons", "invoices", "customers"
* @param {string} params       - An string of parameters as discribed here https://apidocs.chargebee.com/docs/api#pagination_and_filtering
* @param {string} subdomain    - Chargebee's subdomain
* @param {string} token        - Chargebee's API Key
* @param {Array}  result       - the result from request
* @param {Array}  offset       - the next offset to request in CB's API
* @return An array of Elements
* @customfunction
**/
function getChargebeeElements(object, params, subdomain, token) {

  var offset = null
  var result = new Array()
  
  // We ask Chargebee's API while there is a next_offset to request
  do {
    var url = urlBuilder(subdomain, object, params, offset)  
    var response  = JSON.parse(UrlFetchApp.fetch(url, authenticate("GET",token)).getContentText())  
    
    offset = response.next_offset;
    // If the Response is a single object
    if(!response.list) {
      result.push(response)
    }
    // Else, the Response is a list of objects
    else {
      response.list.forEach(function(value){
        result.push(value)
      })
    }
  } while (offset)
  return result
}

/* 
* Authenticate a http request
* @param method   The desired method (i.e. GET, POST, UPDATE)
* @param token       Chargebee's API key
* @return            Request's parameters
*/
function authenticate (method, token) {
  var headers = {
    "Authorization" : "Basic " + Utilities.base64Encode(token + ':')
  }
  var params = {
    "method":method,
    "headers":headers
  }
  return params 
}

/** 
* Build the Chargebee API URL for given parameters
* @param {string} input subdomain    Chargebee's subdomain
* @param {string} input object       Desired Chargebee's API object (i.e. "Addons","Invoices","Customers"...)
* @param {string} input params       A specific ID or an array of parameters
* @return                            Valide encoded URL
**/
function urlBuilder(subdomain, object, params, offset){
  var url = "https://"+subdomain+".chargebee.com/api/v2/"+object
  // because of Apps Script limitations, less calls means less ressources consumption
  var parameters = "?limit=100"
  if(params) {
    parameters += "&"+params
  }
  if (offset){
    parameters += "&offset="+encodeURIComponent(offset)
  } 
  return url+parameters
}


function CB_Addon () {
  return [
    "object",
    "id",
    "name",
    "price",
    "currency_code",
    "period",
    "period_unit",
    "type",
    "unit",
    "charge_type",
    "taxable",
    "taxe_profile_id",
    "tax_code",
    "invoice_notes",
    "enabled_in_portal",
    "sku",
    "accounting_code",
    "accounting_category1",
    "accounting_category2",
    "description",
    "ressource_version",
    "updated_at",
    "status",
  ]
}
    
function CB_Invoice () {
  return [
    "object",
    "id",
    "po_number",
    "customer_id",
    "subscription_id",
    "recurring",
    "status",
    "vat_number",
    "price_type",
    "date",
    "due_date",
    "net_term_days",
    "currency_code",
    "total",
    "amount_paid",
    "amount_adjusted",
    "write_off_amont",
    "credits_applied",
    "amount_due",
    "paid_at",
    "dunning_status",
    "next_retry_at",
    "voided_at",
    "ressource_version",
    "updated_at",
    "sub_total",
    "tax",
    "first_invoice",
    "has_advance_charges",
    "deleted",
    "line_items",
    "discounts",
    "line_item_discounts",
    "taxes",
    "line_item_taxes",
    "linked_payments",
    "applied_credits",
    "adjustement_credit_notes",
    "issued_credit_notes",
    "linked_orders",
    "notes",
    "shipping_address",
    "billing_address",
  ]
}
 
function CB_Invoice_Line_Item () {
  return [
    "id",
    "subscription_id",
    "date_from",
    "date_to",
    "unit_amount",
    "quantity",
    "is_taxed",
    "tax_amount",
    "tax_rate",
    "amount",
    "discount_amount",
    "item_level_discount_amount",
    "description",
    "entity_type",
    "tax_exempt_reason",
    "entity_id",
  ]
}
    
    

function CB_Plan () {
  return [
    "id",
    "name",
    "invoice_name",
    "description",
    "price",
    "currency_code",
    "period",
    "period_unit",
    "trial_period",
    "trial_period_unit",
    "charge_model",
    "free_quantity",
    "setup_cost",
    "status",
    "archived_at",
    "billing_cycles",
    "redirect_url",
    "enabled_in_hosted_pages",
    "enabled_in_portal",
    "tax_code",
    "sku",
    "accounting_code",
    "accounting_category1",
    "accounting_category2",
    "resource_version",
    "updated_at",
    "invoice_notes",
    "taxable",
    "tax_profile_id",
    "meta_data",
  ]
}
    
function CB_Customer () {
  return [
    "object",
    "id",
    "first_name",
    "last_name",
    "email",
    "preferred_currency_code",
    "phone",
    "company",
    "auto_collection",
    "net_term_days",
    "allow_direct_debit",
    "vat_number",
    "registered_for_gst",
    "taxability",
    "locale",
    "entity_code",
    "exempt_number",
    "meta_data",
    "consolidated_invoicing",
    "invoice_notes",
    "resource_version",
    "deleted",
    "billing_address",
    "card_status",
    "promotional_credits",
    "refundable_credits",
    "excess_payments",
    "unbilled_charges",
    "created_at",
    "updated_at",
    "preferred_currency_code"
  ]
}
      
function CB_Subscription () {  
    return [
      "object",
      "id",
      "customer_id",
      "plan_id",
      "plan_quantity",
      "plan_unit_price",
      "billing_period",
      "billing_period_unit",
      "plan_free_quantity",
      "status",
      "trial_start",
      "trial_end",
      "current_term_start",
      "current_term_end",
      "remaining_billing_cycles",
      "created_at",
      "started_at",
      "activated_at",
      "cancelled_at",
      "updated_at",
      "has_scheduled_changes",
      "resource_version",
      "deleted",
      "currency_code",
      "due_invoices_count",
      "due_since",
      "total_dues",
      "mrr",
      "exchange_rate",
      "base_currency_code"
    ]
}  
      
function CB_Subscription_Shipping_Address () {  
  
  return [
    "object",
    "first_name",
    "last_name",
    "company",
    "phone",
    "line1",
    "line2",
    "city",
    "state_code",
    "state",
    "country",
    "validation_status"
  ]
}
      
/* 
* Format a JSON Array from a desired field collection
* @param fields      An array representing the format you are expecting
* @return            
*/
function formatChargebeeObject(fields) {
  return function (object) {
    return fields.map(function (field) {
      if (Array.isArray(object[field])) {
        return JSON.stringify(object[field])
      }
      return object[field]
    })
  }
}

/* 
* Check if n is a number
* @param n   the object to test
* @return            
*/
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
