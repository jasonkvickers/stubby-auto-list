<img src="http://www.stubbyui.com/images/stubby-mock.png" /><br /><br />
Stubby Auto List<br /><br />
Stubby Auto List is in Beta. I had the idea to create this plugin, but I know it still needs some improvements, so send me your suggestions, gripes, etc., and I will do my best to push this forward into a stable plugin that will benifit the web development community. Thanks :)
<br /><br />
**If you have any questions:**
Please feel free to email me @ jasonkvickers@live.com
<br /><br />
StubbyAutoList is a jQuery plugin that provides two core functionalities:<br />
1.	Auto-complete<br />
2.	Multi-selection and display of selected items.<br />
What makes StubbyAutoList different is that it allows you to define a template for both the select items in the auto complete and the data that is displayed once an element is clicked on. By taking this approach to the UI, we are able to accept any object literal and map its values to the template that you have provided. But enough talking, let’s see an example:
<br /><br />
**Create a text input**<br /><br />
The first step in using StubbyAutoList is to define an input.<br /><br />
`<input type="text" id="stubbyInput" class="stubbyList1"/>`

<br /><img src="http://www.stubbyui.com/images/subbydemo.png" /><br /><br />

**Define the template for your list items**

`<div class="stubby-list-item-template"><div class="topicListItem clearfix"><div class="list-item-left stubbyList1">`<br />
`<img stubby-data="ProfileImage" stubby-image-path="/Images/" alt="Profile Image" width="40px" /></div>`<br />
`<div class="list-item-right stubbyList1"><span stubby-data="FirstName"></span>&nbsp;<span stubby-data="LastName"></span>`<br /> 
`<span stubby-data="UserName"></span></div></div></div>`

The important thing to understand here is that "stubby-list-item-template" is a wrapper. This means that only the code contained within this div will actually display in the template. Also, this template introduces some custom HTML attributes:<br />
**stubby-data** - this attribute tells StubbyAutoList which JSON value to map to the element.
<br />**stubby-image-path** - this attribute applies only to `<img />` tags and allows you to define a base path to your image folder. If you plan to feed the entire url through JSON, then just leave this attribute out.
<br /><br />
**Define the template for your display items**<br /><br />
`<div class="stubby-display-item-template"><div class="my-display-container clearfix"><div class="display-item-left">`<br />
`<img stubby-image-path="/Images/" stubby-data="ProfileImage" alt="Profile Image" width="20px" /></div>`<br />
`<div class="display-item-right"><span stubby-data="UserName"></span>`<br />
`<a class="element-button" stubby-delete-button="true">x</a></div></div></div>`
<br /><br />
As with the list item template, the first div is just a wrapper and only the code contained within will be displayed. Oh, and we have another custom HTML attribute:<br />
**stubby-delete-button** - StubbyAutoList will attach an onClick event to this element that allows you to remove an item that you have previously selected.
<br /><br />
**Initialize StubbyAutoList**
<br /><br />
`<script type="text/javascript" src="/path/to/stubbyautolist/jquery.stubbyautolist.js"></script>`<br />
`<script type="text/javascript">`<br />
    `$("#stubbyInput").stubbyautolist({`<br />
        `ajaxUrl: '/GetAjax',`<br />
        `keyValue: 'UserName',`<br />
        `focusClass: 'stubbyList1'`<br />
    });
`</script>`
<br /><br />
**ajaxUrl** - this is the url that you are retrieving the data from<br />
**keyValue** - this is the "key" that you will be basing your calls off of. (ex: the value from the JSON object that you want to post back)<br />
**focusClass** - if you plan to use more than one Stubby List per page, you need to define a focusClass that will be unique to the list instance.

<br /><br />
Stubby Auto List posts back to your application as an Array (string[])