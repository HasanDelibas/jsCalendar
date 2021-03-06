/*
 * jsCalendar v1.2
 * 
 * 
 * MIT License
 * 
 * Copyright (c) 2017 Grammatopoulos Athanasios-Vasileios
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

var jsCalendar = (function(){

    // Constructor
    function JsCalendar(){
        // No parameters
        if (arguments.length == 0) {
            // Do nothing
            return;
        }
        else {
            // Construct calendar
            this._construct(arguments);
        }
    }

    // Languages
    JsCalendar.prototype._construct = function(args) {
        // Parse agruments
        var args = this._parseArguments(args);
        // Init calendar
        this._init(args.options);
        // Init target
        this._setTarget(args.target);
        this._initTarget();
        // Set date
        this._setDate(args.date);
        // Create
        this._create();
        // Update
        this._update();
    }

    // Languages
    JsCalendar.prototype.languages = {
        // Default english language
        en : {
            // Months Names
            months : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            // Days Names
            days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }
    };

    // Init calendar
    JsCalendar.prototype._init = function(options) {
        // Init elements object
        this._elements = {};
        // Events init
        this._events = {};
        this._events.date = [];
        this._events.month = [];
        // Dates variables
        this._now = null;
        this._date = null;
        this._selected = [];
        // Language object
        this.language = {};
        // Parse options
        this._parseOptions(options);
    };

    // Parse options
    JsCalendar.prototype._parseArguments = function(args) {
        // Arguments object
        var obj = {
            target : null,
            date : new Date(),
            options : {}
        };

        // If no arguments
        if (args.length === 0) {
            // Throw an error
            throw new Error("jsCalendar: Not parameters were given.");
        }

        // Only 1 argument
        else if (args.length === 1) {

            // If html element
            if (
                ((typeof HTMLElement === "object") ? (args[0] instanceof HTMLElement) : args[0]) &&
                (typeof args[0] === "object") && (args[0] !== null) && (args[0].nodeType === 1) &&
                (typeof args[0].nodeName === "string")
            ) {
                obj.target = args[0];
            }

            // Options argument
            else {
                // Init arguments
                obj.options = args[0];
                // Get target
                if (typeof args[0].target !== "undefined") {
                    obj.target = args[0].target;
                }
                else {
                    // Throw an error
                    throw new Error("jsCalendar: Not target was given.");
                }
                // Get date
                if (typeof args[0].date !== "undefined") {
                    obj.date = args[0].date;
                }
            }
        }

        // Many arguments
        else {

            // First is target
            obj.target = args[0];

            // If date
            if (args.length >= 2) {
                obj.date = args[1];
            }

            // If options
            if (args.length >= 3) {
                obj.options = args[2];
            }

        }

        // Return object
        return obj;
    };

    // Parse options
    JsCalendar.prototype._parseOptions = function(options) {
        // Default options
        this._options = {
            language : "en",
            zeroFill : false,
            monthFormat : "month",
            dayFormat : "D",
            navigator : true,
            navigatorPosition : "both"
        };
        // Check options
        if (typeof options.zeroFill !== "undefined"){
            if (options.zeroFill === "false" || !options.zeroFill) {
                this._options.zeroFill = false;
            }
            else {
                this._options.zeroFill = true;
            }
        }
        if (typeof options.monthFormat !== "undefined"){
            this._options.monthFormat = options.monthFormat;
        }
        if (typeof options.dayFormat !== "undefined"){
            this._options.dayFormat = options.dayFormat;
        }
        if (typeof options.navigator !== "undefined"){
            if (options.navigator === "false" || !options.navigator) {
                this._options.navigator = false;
            }
            else {
                this._options.navigator = true;
            }
        }
        if (typeof options.navigatorPosition !== "undefined"){
            this._options.navigatorPosition = options.navigatorPosition;
        }

        // Language
        if (typeof options.language === "string" && typeof this.languages[options.language] !== "undefined"){
            this._options.language = options.language;
        }
        // Set language
        this.setLanguage(this._options.language);
    };

    // Set target
    JsCalendar.prototype._setTarget = function(element) {
        // Save element
        this._target = element;
    };

    // Init target
    JsCalendar.prototype._initTarget = function() {
        // Add class
        if (this._target.className.length > 0){
            this._target.className += " ";
        }
        this._target.className += "jsCalendar";

        // Create table
        this._elements.table = document.createElement("table");
        // Create table header
        this._elements.head = document.createElement("thead");
        this._elements.table.appendChild(this._elements.head);
        // Create table body
        this._elements.body = document.createElement("tbody");
        this._elements.table.appendChild(this._elements.body);

        // Insert on page
        this._target.appendChild(this._elements.table);
    };

    // Set a Date
    JsCalendar.prototype._setDate = function(date) {
        this._now = this._parseDate(date);
        this._date = new Date(this._now.getFullYear(), this._now.getMonth(), 1);
    };

    // Parse Date
    JsCalendar.prototype._parseDate = function(date) {

        // If set now date
        if (typeof date === "undefined" || date === null || date === "now") {
            // Get date now
            date = new Date();
        }

        // If date is string
        else if (typeof date === "string") {
            // Parse date string
            date = date.replace(/-/g,"\/").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4,4})$/i);
            // If match
            if (date !== null) {
                // Parse date
                date = new Date(date[3], parseInt(date[2], 10)-1, date[1]);
            }
            // Can't parse string
            else {
                // Throw an error
                throw new Error("jsCalendar: Failed to parse date.");
            }
        }

        // If it is a number
        else if (typeof date === "number") {
            // Get time from timestamp
            date = new Date(date);
        }

        // If it not a date 
        else if (!(date instanceof Date)) {
            // Throw an error
            throw new Error("jsCalendar: Invalid date.");
        }

        // Return date
        return new Date(date.getTime());
    };

    // Get visible month
    JsCalendar.prototype._getVisibleMonth = function(date) {
        // For date
        if (typeof date === "undefined") {
            // Get saved date
            date = this._date;
        }
        else {
            date = this._parseDate(date);
        }

        // Get month's first day
        var first = new Date(date.getTime());
        first.setDate(1);

        // Get month's name
        var name = this._options.monthFormat;
        name = name.replace(/month/i, this.language.months[first.getMonth()]);
        name = name.replace(/MMM/i, this.language.months[first.getMonth()].substring(0, 3));
        name = name.replace(/##/i, (first.getMonth() < 9 ? "0" : "") + (first.getMonth() + 1));
        name = name.replace(/#/i, first.getMonth() + 1);
        name = name.replace(/YYYY/i, first.getYear() + 1900);

        // Get visible days
        var days = this._getVisibleDates(date);
        var daysInMonth = new Date(first.getYear() + 1900, first.getMonth() + 1, 0).getDate();

        var current = -1;
        // If this is the month
        if (first.getYear() === this._now.getYear() && first.getMonth() === this._now.getMonth()) {
            // Calculate current
            current = first.getDay() + this._now.getDate() - 1;
        }

        // Return object
        return {
            name : name,
            days : days,
            start : first.getDay() + 1,
            current : current,
            end : first.getDay() + daysInMonth
        };
    };

    // Get visible dates
    JsCalendar.prototype._getVisibleDates = function(date) {
        // For date
        if (typeof date === "undefined") {
            // Get saved date
            date = this._date;
        }
        else {
            date = this._parseDate(date);
        }

        // Visible days array
        var dates = [];
        // Get first day of the month
        var first = new Date(date.getTime());
        first.setDate(1);

        // Count days of previus month
        var previous = first.getDay();
        // Set day to month's first
        var day = first;
        // Previous month's days
        while (previous > 0) {
            // Calculate previus day
            day = new Date(day.getTime() - 864E5);
            // Add page on frond of the list
            dates.unshift(day);
            // Previus
            previous --;
        }

        // Set day to month's first
        day = first;
        // This month's days
        do {
            // Add page on back of the list
            dates.push(day);
            // Calculate next day
            day = new Date(day.getTime() + 864E5);
            // Repeat untill next month
        } while (day.getDate() != 1);

        // Next month's days
        var next = 42 - dates.length;
        // Add days left
        while (next > 0) {
            // Add page on back of the list
            dates.push(day);
            // Calculate next day
            day = new Date(day.getTime() + 864E5);
            // Next
            next --;
        }

        // Return days
        return dates;
    };

    // Create calendar
    JsCalendar.prototype._create = function(date) {
        // Save instance
        var that = this;

        // Set created flag
        this._elements.created = true;

        // Head rows
        this._elements.headRows = [];
        for (var i = 0; i < 2; i++) {
            this._elements.headRows.push(document.createElement("tr"));
            this._elements.head.appendChild(this._elements.headRows[i]);
        }

        // Month row
        var title_header = document.createElement("th");
        title_header.setAttribute("colspan", 7);
        this._elements.headRows[0].className = "jsCalendar-title-row";
        this._elements.headRows[0].appendChild(title_header);

        this._elements.headLeft = document.createElement("div");
        this._elements.headLeft.className = "jsCalendar-title-left";
        title_header.appendChild(this._elements.headLeft);
        this._elements.month = document.createElement("div");
        this._elements.month.className = "jsCalendar-title-name";
        title_header.appendChild(this._elements.month);
        this._elements.headRight = document.createElement("div");
        this._elements.headRight.className = "jsCalendar-title-right";
        title_header.appendChild(this._elements.headRight);

        // Navigation
        if (this._options.navigator) {
            this._elements.navLeft = document.createElement("div");
            this._elements.navLeft.className = "jsCalendar-nav-left";
            this._elements.navRight = document.createElement("div");
            this._elements.navRight.className = "jsCalendar-nav-right";

            if (this._options.navigatorPosition === "left") {
                this._elements.headLeft.appendChild(this._elements.navLeft);
                this._elements.headLeft.appendChild(this._elements.navRight);
            }
            else if (this._options.navigatorPosition === "right") {
                this._elements.headRight.appendChild(this._elements.navLeft);
                this._elements.headRight.appendChild(this._elements.navRight);
            }
            else {
                this._elements.headLeft.appendChild(this._elements.navLeft);
                this._elements.headRight.appendChild(this._elements.navRight);
            }

            // Event listeners
            this._elements.navLeft.addEventListener('click', function(event){
                that.previous();
                that._eventFire_monthChange(event, that._date);
            }, false);
            this._elements.navRight.addEventListener('click', function(event){
                that.next();
                that._eventFire_monthChange(event, that._date);
            }, false);
        }

        // Days row
        this._elements.headRows[1].className = "jsCalendar-week-days";
        title_header.className = "jsCalendar-title";
        this._elements.days = [];
        var name;
        for (var i = 0; i < 7; i++) {
            this._elements.days.push(document.createElement("th"));
            this._elements.headRows[1].appendChild(this._elements.days[
                this._elements.days.length -1
            ]);

            name = this._options.dayFormat;
            name = name.replace(/day/i, this.language.days[i]);
            name = name.replace(/DDD/i, this.language.days[i].substring(0, 3));
            name = name.replace(/DD/i, this.language.days[i].substring(0, 2));
            name = name.replace(/D/, this.language.days[i].substring(0, 1));
            this._elements.days[this._elements.days.length - 1].textContent = name;
        }

        // Body rows
        this._elements.bodyRows = [];
        this._elements.bodyCols = [];
        // 6 rows
        for (var i = 0; i < 6; i++) {
            this._elements.bodyRows.push(document.createElement("tr"));
            this._elements.body.appendChild(this._elements.bodyRows[i]);
            // 7 days
            for (var j = 0; j < 7; j++) {
                this._elements.bodyCols.push(document.createElement("td"));
                this._elements.bodyRows[i].appendChild(this._elements.bodyCols[i * 7 + j]);
                this._elements.bodyCols[i * 7 + j].addEventListener('click', (function(index){
                    return function (event) {
                        that._eventFire_dateClick(event, that._active[index]);
                    }
                })(i * 7 + j), false);
            }
        }
    };

    // Select dates on calendar
    JsCalendar.prototype._selectDates = function(dates) {
        // Copy array instance
        dates = dates.slice();

        // Parse dates
        for (var i = 0; i < dates.length; i++) {
            dates[i] = this._parseDate(dates[i]);
            dates[i].setHours(0, 0, 0, 0);
            dates[i] = dates[i].getTime();
        }

        // Insert dates on array
        for (var i = dates.length - 1; i >= 0; i--) {
            // If not already selected
            if (this._selected.indexOf(dates[i]) < 0) {
                this._selected.push(dates[i]);
            }
        }
    };

    // Unselect dates on calendar
    JsCalendar.prototype._unselectDates = function(dates) {
        // Copy array instance
        dates = dates.slice();

        // Parse dates
        for (var i = 0; i < dates.length; i++) {
            dates[i] = this._parseDate(dates[i]);
            dates[i].setHours(0, 0, 0, 0);
            dates[i] = dates[i].getTime();
        }

        // Remove dates of the array
        var index;
        for (var i = dates.length - 1; i >= 0; i--) {
            // If selected
            index = this._selected.indexOf(dates[i]);
            if (index >= 0) {
                this._selected.splice(index, 1);
            }
        }
    };

    // Unselect all dates on calendar
    JsCalendar.prototype._unselectAllDates = function() {
        // While not empty
        while (this._selected.length) {
            this._selected.pop();
        }
    };

    // Update calendar
    JsCalendar.prototype._update = function() {
        // Get month info
        var month = this._getVisibleMonth(this._date);
        // Save data
        this._active = month.days.slice();
        // Update month name
        this._elements.month.textContent = month.name;

        // Check zeros filling
        var prefix = "";
        if (this._options.zeroFill) {
            prefix = "0";
        }

        // Populate days
        var text;
        for (var i = month.days.length - 1; i >= 0; i--) {
            text = month.days[i].getDate();
            this._elements.bodyCols[i].textContent = (text < 10 ? prefix + text : text);

            // If date is selected
            if (this._selected.indexOf(month.days[i].getTime()) >= 0) {
                this._elements.bodyCols[i].className = "jsCalendar-selected";
            }
            else {
                this._elements.bodyCols[i].removeAttribute("class");
            }
        }

        // Previous month
        for (var i = 0; i < month.start - 1; i++) {
            this._elements.bodyCols[i].className = "jsCalendar-previous";
        }
        // Current day
        if(month.current >= 0){
            if (this._elements.bodyCols[month.current].className.length > 0) {
                this._elements.bodyCols[month.current].className += " jsCalendar-current";
            }
            else {
                this._elements.bodyCols[month.current].className = "jsCalendar-current";
            }
        }
        // Next month
        for (var i = month.end; i < month.days.length; i++) {
            this._elements.bodyCols[i].className = "jsCalendar-next";
        }
    };

    // Fire all event listeners
    JsCalendar.prototype._eventFire_dateClick = function(event, date) {
        // Events
        for (var i = 0; i < this._events.date.length; i++) {
            (function(callback) {
                // Call asynchronous
                setTimeout(function(){
                    // Call callback
                    callback(event, new Date(date.getTime()));
                }, 0);
            })(this._events.date[i]);
        };
    };

    // Fire all event listeners
    JsCalendar.prototype._eventFire_monthChange = function(event, date) {
        // Get first day of the month
        var month = new Date(date.getTime());
        month.setDate(1);
        // Events
        for (var i = 0; i < this._events.month.length; i++) {
            (function(callback) {
                // Call asynchronous
                setTimeout(function(){
                    // Call callback
                    callback(event, new Date(month.getTime()));
                }, 0);
            })(this._events.month[i]);
        };
    };

    // Add a event listener
    JsCalendar.prototype.onDateClick = function(callback) {
        // If callback is a function
        if(typeof callback == "function"){
            // Add to the list
            this._events.date.push(callback);
        }

        // Not a function
        else {
            // Throw an error
            throw new Error("jsCalendar: Invalid callback function.");
        }

        // Return
        return this;
    };

    // Add a event listener
    JsCalendar.prototype.onMonthChange = function(callback) {
        // If callback is a function
        if(typeof callback == "function"){
            // Add to the list
            this._events.month.push(callback);
        }

        // Not a function
        else {
            // Throw an error
            throw new Error("jsCalendar: Invalid callback function.");
        }

        // Return
        return this;
    };

    // Goto a date
    JsCalendar.prototype.set = function(date){
        // Set new date
        this._setDate(date);
        // Refresh
        this.refresh();

        // Return
        return this;
    };

    // Refresh
    // Safe _update
    JsCalendar.prototype.refresh = function(date) {
        // If date provided
        if (typeof date !== "undefined") {
            this._date = this._parseDate(date);
        }

        // If calendar elements ready
        if (this._elements.created === true) {
            this._update();
        }

        // Return
        return this;
    };

    // Next month
    JsCalendar.prototype.next = function(n){
        // Next number
        if (typeof n !== "number") {
            n = 1;
        }

        // Set date
        this._date = new Date(this._date.getFullYear(), this._date.getMonth() + n, 1);
        this.refresh();

        // Return
        return this;
    };

    // Next month
    JsCalendar.prototype.previous = function(n){
        // Next number
        if (typeof n !== "number") {
            n = 1;
        }

        // Set date
        this._date = new Date(this._date.getFullYear(), this._date.getMonth() - n, 1);
        this.refresh();

        // Return
        return this;
    };

    // Goto a date
    JsCalendar.prototype.goto = function(date){
        this.refresh(date);

        // Return
        return this;
    };

    // Reset to the date
    JsCalendar.prototype.reset = function(){
        this.refresh(this._now);

        // Return
        return this;
    };

    // Select dates
    JsCalendar.prototype.select = function(dates){
        // If no arguments
        if (typeof dates === "undefined") {
            // Return
            return this;
        }

        // If dates not array
        if (!(dates instanceof Array)) {
            // Lets make it an array
            dates = [dates];
        }
        // Select dates
        this._selectDates(dates);
        // Refresh
        this.refresh();

        // Return
        return this;
    };

    // Unselect dates
    JsCalendar.prototype.unselect = function(dates){
        // If no arguments
        if (typeof dates === "undefined") {
            // Return
            return this;
        }

        // If dates not array
        if (!(dates instanceof Array)) {
            // Lets make it an array
            dates = [dates];
        }
        // Unselect dates
        this._unselectDates(dates);
        // Refresh
        this.refresh();

        // Return
        return this;
    };

    // Unselect dates
    JsCalendar.prototype.clearselect = function(dates){
        // Unselect all dates
        this._unselectAllDates();
        // Refresh
        this.refresh();

        // Return
        return this;
    };

    // Set language
    JsCalendar.prototype.setLanguage = function(code) {
        // Check if language exist
        if (typeof code !== "string"){
            // Throw an error
            throw new Error("jsCalendar: Invalid language code.");
        }
        if (typeof this.languages[code] === "undefined"){
            // Throw an error
            throw new Error("jsCalendar: Language not found.");
        }

        // Change language
        this._options.language = code;

        // Set new language as active
        this.language.months = this.languages[this._options.language].months;
        this.language.days = this.languages[this._options.language].days;

        // Refresh calendar
        this.refresh();

        // Return
        return this;
    }


    // Static foo methods (well... not realy static)

    // Auto init calendars
    JsCalendar.autoFind = function(){
        // Get all auto-calendars
        var calendars = document.getElementsByClassName("auto-jsCalendar");
        // Temp options variable
        var options;
        // For each auto-calendar
        for (var i = 0; i < calendars.length; i++) {
            // If not loaded
            if(calendars[i].getAttribute("jsCalendar-loaded") !== "true") {
                // Set as loaded
                calendars[i].setAttribute("jsCalendar-loaded", "true");
                // Init options
                options = {};
                // Add options
                for(var j in calendars[i].dataset){
                    options[j] = calendars[i].dataset[j];
                }
                // Set target
                options.target = calendars[i];
                // Create
                new jsCalendar(options);
            }
        }
    };
    
    // Get a new object
    JsCalendar.new = function(){
        // Create new object
        var obj = new JsCalendar();
        // Construct calendar
        obj._construct(arguments);
        // Return new object
        return obj;
    };
    
    // Add a new language
    JsCalendar.addLanguage = function(language){
        // Check if language object is valid
        if (typeof language === "undefined") {
            // Throw an error
            throw new Error("jsCalendar: No language object was given.");
        }
        // Check if valid language code
        if (typeof language.code !== "string") {
            // Throw an error
            throw new Error("jsCalendar: Invalid language code.");
        }
        // Check language months
        if (!(language.months instanceof Array)) {
            // Throw an error
            throw new Error("jsCalendar: Invalid language months.");
        }
        if (language.months.length !== 12) {
            // Throw an error
            throw new Error("jsCalendar: Invalid language months length.");
        }
        // Check language days
        if (!(language.days instanceof Array)) {
            // Throw an error
            throw new Error("jsCalendar: Invalid language days.");
        }
        if (language.days.length !== 7) {
            // Throw an error
            throw new Error("jsCalendar: Invalid language days length.");
        }

        // Now save language
        JsCalendar.prototype.languages[language.code] = {
            // Save months
            months : language.months.slice(),
            // Save days
            days : language.days.slice()
        };
    };

    // Load any lanuguage on the load list
    (function(){
        // If a list exist
        if (typeof window.jsCalendar_language2load !== "undefined") {
            // While list not empty
            while (window.jsCalendar_language2load.length) {
                // Make it asynchronous
                setTimeout((function (language) {
                    // Return timeout callback
                    return function() {
                        JsCalendar.addLanguage(language);
                    };
                })(window.jsCalendar_language2load.pop()), 0);
            };
            // Clean up useless list
            delete window.jsCalendar_language2load;
        }
    })();

    // Return
    return JsCalendar;
})();

// We love anonymous functions
(function(){
    // Init auto calendars
    // After the page loads
    window.addEventListener("load", function() {
        // Get calendars
        jsCalendar.autoFind();
    }, false);
})();
