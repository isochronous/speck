speck
=====

A set of utility functions for easily rendering dust javascript templates in a backbone project with requirejs. I wrote this because I wanted to use linked-in's dustjs on a project and didn't like to repeat the compilation and rendering syntax over and over. 

A basic usage, given that your model has properties referenced in the dust file:
###dust file:
```html
<h1>Friends of {name}</h1>
<ul>
{#friends}
 <li>{name}</li>
{/friends}
</ul>
```

###your model:
```javascript
new UserModel({name:'Bob', id:444, friends: [{name:'Joe'},{name:'Alex'}]});
```

###a simple model based view
```javascript
define(['backbone', 'speck!./user'], function(Backbone, speck){
	return Backbone.View.extend({
		render: function(){
			speck.html(this.model, this.$el);
		}
	});
});
```

If your view's model is a collection you'll need to pass in a collection name to dust:

###a list based view
```javascript
define(['backbone', 'speck!./userList'], function(Backbone, speck){
	return Backbone.View.extend({
		render: function(){
			speck.html({users: this.model}, this.$el);
		}
	});
});
```

## Requirements

* Requirejs: http://requirejs.org/
* Text plugin: http://requirejs.org/docs/download.html#text
* linkedin djustjs: https://github.com/linkedin/dustjs/
* Backbone (optional, but designed to use with): http://backbonejs.org/

The code assumes you have 'dustjs-linkedin' path and shim defined in your requirejs constructor:

```javascript
require.config({
	paths: {
		'dustjs-linkedin': '../libs/dust'
	},
	shim: {
		'dustjs-linkedin': {
			exports: 'dust'
		},
		'speck' : {
			deps: ['dustjs-linkedin', 'text']
		}
	}
});
```