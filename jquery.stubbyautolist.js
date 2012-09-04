(function ($) {
    var stubbyautolist = function (element, options) {
        var opts = $.extend({
            ajaxUrl: '/',
            keyValue: '',
            searchKey: '',                                              // Key to search on server-side
            displayClickedItems: true,                                  // Show clicked items
            maxClickedItems: true,                                      // Determines the max list items that can be clicked on and displayed
            listItemTemplate: $(".stubby-list-item-template"),          // Template for the list items
            displayItemTemplate: $(".stubby-display-item-template"),    // Template for how list items are displayed once they are clicked
            displayContainer: $("#stubby-display"),                     // Div that will hold the display items
            focusClass: 'stubbyautolist'
        }, options);

        var stubbyautolistVars = {
            focusOutTimeout: null,      // (setTimeOut) holds the timeout of the list
            timeout: null,
            currVal: null,
            searchVal: null,
            topicList: new Array(),     // (string) Id of the ul containing the list itmes
            listData: null,             // (json) holds results of the data query
            keyHolder: null,

            /***** DOM Objects *****/
            obj: null,                  // (obj) Current object
            objArray: new Array(),      // (Array(obj) Holds list of new { dataIemId: $(this).attr('id'), jsonObj: currJsonObj }
            searchResults: null,        // (obj) Id of the search list container
            searchHeader: null,         // (obj) the search header
            searchList: null,           // (obj) Id of the ul containing the list itmes
            activeItem: null,           // (obj) Current active list item

            /***** Boolean Checks *****/
            keyMode: false,             // (bool) true if user is navigating list with arrow keys
            listClicked: false,         // (bool) true if a list item was clicked
            update: false,
            searchHasFocus: false       // (bool) true if the search input has focus
        };

        stubbyautolistVars.obj = $(element);

        // Hide the templates
        opts.listItemTemplate.hide();
        opts.displayItemTemplate.hide();

        // Create container
        var searchListContainer = $('<div></div>').attr({
            id: stubbyautolistVars.obj.attr('id') + '-stubby-list-results'
        });
        stubbyautolistVars.searchResults = searchListContainer;

        // Create inner container and append
        var searchListContainerInner = $('<div></div>').attr({
            id: stubbyautolistVars.obj.attr('id') + '-stubby-list-results-inner'
        });
        searchListContainer.append(searchListContainerInner);

        // Create and append results header
        var searchListHeader = $('<div></div>').attr({
            id: stubbyautolistVars.obj.attr('id') + '-stubby-list-results-header'
        });
        stubbyautolistVars.searchHeader = searchListHeader;
        searchListContainerInner.append(searchListHeader);

        // Create and append the unordered list
        var searchListUl = $('<ul></ul>').attr({
            id: stubbyautolistVars.obj.attr('id') + '-stubby-list-results-list'
        });
        stubbyautolistVars.searchList = searchListUl;
        searchListContainerInner.append(searchListUl);

        // Add created items to page
        stubbyautolistVars.obj.after(searchListContainer);

        stubbyautolistVars.obj.bind({
            copy: function () {
                setSearchChangeTimeout();
            },
            paste: function () {
                setSearchChangeTimeout();
            },
            cut: function () {
                setSearchChangeTimeout();
            },
            focus: function () {
                stubbyautolistVars.timeout = setTimeout(searchChanged, 0.1);
                searchHasFocus = true;
            },
            keyup: function (e) {
                if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13) {
                    setSearchChangeTimeout();
                    stubbyautolistVars.keyMode = false;
                    stubbyautolistVars.activeItem = null;
                }
            }
        });

        // Initially Hide the results
        stubbyautolistVars.searchResults.hide();

        /* Function [Private] getData()
         * Description: retrieves data based on property ajaxUrl
         */
        var getData = function () {
            $.getJSON(opts.ajaxUrl, { term: stubbyautolistVars.obj.val().toLowerCase(), searchKey: opts.searchKey })
            .success(function (results) {
                stubbyautolistVars.listData = results;

                // show the list
                stubbyautolistVars.searchList.empty();
                stubbyautolistVars.searchHeader.show();
                stubbyautolistVars.searchResults.show();

                // Get the list item template, map data, and attach to list
                mapListItemData(stubbyautolistVars.searchList, opts.listItemTemplate, stubbyautolistVars.listData);
            })
            .error(function (e) {
                debug(e, stubbyautolistVars.obj);
            });
        }

        /* Function [Private] debug()
         * Description: Debugging
         * Param: param - error generated from method
         * Param: obj - object being used when error was thrown
         */
        var debug = function(param, obj) {
            if (window.console && window.console.log) {
                window.console.log(param + ": " + obj);
            }
        }

        /* Function [Private] mapListItemData
         * Description: Maps json data to user defined list template
         * Param: ul - ul object that contains the resulting list
         * Param: template - user defined template for the list items
         * Param: data - JSON data retrived via the getData() method
         */
        var mapListItemData = function(ul, template, data) {
            var templateItem;
            var counter = 0;

            // TODO: we need returnResults to be automactically mapped, otherwise the user must make sure
            // that they are returning param 'returnResults' in data
            $.each(data.stubbyData, function (index, item) {
                templateItem = template;
                var newLi = $('<li></li>');

                // if this is the first dataitem add stubby-list-first class
                if (counter == 0) {
                    newLi.addClass('stubby-list-first');
                }

                // if this is the last dataitem add stubby-list-last
                if ((counter + 1) == data.stubbyData.length) {
                    newLi.addClass('stubby-list-last');
                }

                // add focus class to the li
                newLi.addClass(opts.focusClass);

                // set the id of the li
                newLi.attr('id', 'stubby-list-item-' + stubbyautolistVars.obj.attr('id') + '-' + counter);

                // add items to obj array
                stubbyautolistVars.objArray.push({ dataItemId: newLi.attr('id'), jsonObj: item });

                // once the objects are created and values assigned, we need to add it to the list as raw html
                newLi.append(mapToTemplate(template, item));

                // if the key was specified, create the hidden field
                if (stubbyautolistVars.keyHolder != null)
                    newLi.append(stubbyautolistVars.keyHolder);

                newLi.click(function () {
                    listClicked = true;
                    handleTopicAdd(newLi);

                    // TODO: there has to be a more elegant way to make the search results dissapear
                    //clearTimeout(focusOutTimeout);
                });

                ul.append(newLi);
                counter++;
            });
        }

        /* Function [Private] setSearchChangeTimeout
         * Description: timeout for checking connectionsBox change event
         */
        var setSearchChangeTimeout = function() {
            //clearTimeout(stubbyautolistVars.timeout);
            stubbyautolistVars.timeout = setTimeout(searchChanged, 0.1);
        }

        /* Function [Private] searchChanged
         * Description: search change handling method
         */
        var searchChanged = function() {
            stubbyautolistVars.currVal = stubbyautolistVars.obj.val();
            if ((stubbyautolistVars.currVal) && (stubbyautolistVars.currVal != stubbyautolistVars.searchValue) && (stubbyautolistVars.currVal != '')) {
                getData();
            } else {
                if (stubbyautolistVars.currVal != '') {
                    setSearchChangeTimeout();
                } else {
                    stubbyautolistVars.searchList.empty();
                    stubbyautolistVars.searchResults.hide();
                }
            }
        }

        /* Function [Private] mapToTemplate
         * Description: maps JSON object literal to user-defined template
         * Param: template [jQuery obj] - user-defined template
         * Param: literal - JSON object literal
         */
        var mapToTemplate = function(template, literal) {
            var templateCopy = template;

            $.each(literal, function (k, v) {
                // see if an element exists that needs this JSON value
                var element = templateCopy.find('[stubby-data="' + k + '"]');

                // if current key is our keyValue, save the value
                if (k == opts.keyValue) {
                    stubbyautolistVars.keyHolder = $('<span></span>').attr({
                        'stubby-item-key': v
                    });
                }

                // if stubby-data for this value exists in the template, add the value
                if (element != null && element != 'undefined') {
                    //TODO: Add image support (is a partial url already provided? If so, just add stubby-data to the end of it)
                    if (element.is('input')) {
                        element.val(v);
                    } else if (element.is('img')) {
                        // If they included image page in the templage, append the value, else just append value
                        element.attr('src', (element.attr('stubby-image-path') + v));
                    } else {
                        element.html(v);
                    }
                }
            });

            return templateCopy.html();
        }

        /* Function [Private] handleAddTopic
         * Description: handler for adding chosen topics to current context 
         * Param: element - list item object that was clicked
         */
        var handleTopicAdd = function(element) {
            var existsInList = false;
            var existsCounter = 0;
            var templateItem = null;

            //Loop through the current selected topics to make sure that the the passed element is not already there
            $(".stubby-list-hidden_" + stubbyautolistVars.obj.attr('id')).each(function () {
                // see if an element exists that needs this JSON value
                var key = $(element).find('[stubby-item-key]').attr('stubby-item-key');
                if (key == $(this).val()) {
                    existsInList = true;
                }
                existsCounter++;
            });

            // if the topic is not already in the list, add it
            if (!existsInList) {
                // create the hidden form field
                $('<input>').attr({
                    type: 'hidden',
                    id: opts.keyValue + (existsCounter + 1),
                    name: opts.keyValue,
                    value: element.find('[stubby-data="' + opts.keyValue + '"]').html()
                }).addClass("stubby-list-hidden_" + stubbyautolistVars.obj.attr('id')).appendTo(stubbyautolistVars.obj);

                // add topic to array
                stubbyautolistVars.topicList.push(element.html());

                // Display clicked items
                if (opts.displayClickedItems) {
                    // create new stubby display item div
                    var stubbyDiv = $('<div></div>');
                    stubbyDiv.addClass('stubby-display-item');

                    // get a copy of the template for displaying the data
                    //templateItem = $(opts.displayItemTemplate).html();
                    newItem = $(opts.displayItemTemplate);

                    // get the literal corresponding to the clicked list item
                    var literal = getObjectLiteral(element.attr('id'));

                    // find the delete button and add onclick event
                    var deleteButton = newItem.find('[stubby-delete-button]');
                    deleteButton.attr('id', 'delete_' + element.attr('id'));

                    // map data and add to display
                    stubbyDiv.append(mapToTemplate(newItem, literal));
                    $(opts.displayContainer).append(stubbyDiv);

                    $('#delete_' + element.attr('id')).bind('click', function () {
                        //alert("delete clicked");
                        handleTopicRemove(element, (opts.keyValue + (existsCounter + 1)), stubbyDiv);
                    });
                }
            }
        }

        /* Function [Private] handleTopicRemove
         * Description: Handles the removal of selected topics
         * Param: element - template element
         * Param: hiddenId - id of hidden field that needs to be removed
         * Param displayTopic - display element that needs to be removed
         */
        var handleTopicRemove = function(element, hiddenId, displayTopic) {
            // remove hidden element
            $('#' + hiddenId).remove();

            // remove from topicList array
            var arrayIndex = stubbyautolistVars.topicList.indexOf(element.html());
            stubbyautolistVars.topicList.splice(arrayIndex, 1);

            // remove displayed topic
            displayTopic.remove();
        }

        /* Function [Private] getObjectLiteral
         * Description: retrieves JSON object based on id of list item it was assigned to
         * Param: string - id of list item
         */
        var getObjectLiteral = function(indexId) {
            var obj = null;

            $.each(stubbyautolistVars.objArray, function (k, v) {
                if (v.dataItemId == indexId)
                    obj = v.jsonObj;
            });

            return obj;
        }

        /* Handle Document Ready  */
        $(document).ready(function () {
            $(document).click(function (e) {
                //alert($(e.target).parent().attr('class'));
                if (!$(e.target).hasClass(opts.focusClass) && !$(e.target).parent().hasClass(opts.focusClass)) {
                    focusOutTimeout = setTimeout(handleFocusOut, 100);
                }
            });
        });
        
        // timeout for checking to see of the searchbox has focus
        var handleFocusOut = function() {
            stubbyautolistVars.searchList.empty();
            stubbyautolistVars.searchResults.hide();
            keyMode = false;
            activeItem = null;
            searchHasFocus = false;
        }
    }

    $.fn.stubbyautolist = function (options) {
        return this.each(function () {
            var element = $(this);
            if (element.data(options.focusClass)) return;
            var newautolist = new stubbyautolist(this, options)
            element.data(options.focusClass, newautolist);
        });
    };
})(jQuery)