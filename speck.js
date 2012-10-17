define(['jquery', 'backbone', 'module', 'text', 'dustjs-linkedin'], function($, Backbone, module, text, dust) {
    var masterConfig = module.config();
    return {
        load: function(name, req, onLoad, config) {
            var url = name;
            if(masterConfig && 'speckUrl' in masterConfig && url[0] !== '.'){
                url = masterConfig.speckUrl + url;
            }
            if (url.indexOf('.dust', url.length - 5) === -1) {
                url = url + '.dust';
            }
            //TODO: Perhaps hook this up to marionette's template cache?
            text.get(req.toUrl(url), function(data) {
                var compiled = dust.compile(data, name);
                dust.loadSource(compiled);
                var normalizeObject = function(obj) {
                    if (obj === undefined || obj === null) {
                        return {};
                    }
                    return JSON.parse(JSON.stringify(obj));
                };

                // Added updateUI to allow render method to NOT update UI
                // if we just want to get the HTML back
                var render = function(element, obj, updateUi){
                    var ret = $.Deferred();

                    dust.render.call(dust, name, obj, function(err, out) {
                        if (err) {
                            ret.reject(err);
                            throw err;
                        }
                        if(!('jquery' in element)) {
                            element = $(element);
                        }
                        if (updateUi === true) {
                            element.html(out);
                        }
                        ret.resolve(out);
                    });
                    return ret;
                };
                var out = {
                    render: function(obj, callback) {
                        dust.render.call(dust, name, obj, callback);
                    },
                    // Modified: now takes an optional third param (defaults to false) that determines
                    // whether or not the call to HTML updates the UI as well as returning the markup
                    html: function(element, obj, update) {
                        var updateUi = update || false;
                        // Modified: added normalization to call
                        return render(element, normalizeObject(obj), updateUi);
                    },
                    view: function(view, replace){
                        // Marionette views have a serializeData method that determines
                        // which data should be attached to the view
                        var obj = normalizeObject(view.serializeData());
                        var context = dust.makeBase(view);
                        var instance = context.push(obj);
                        if(replace) {
                            var old = view.$el;
                            return render(old, instance, true).done(function(){
                                var content = old.contents();
                                //put it in the correct place in the dom:
                                old.replaceWith(content);
                                view.setElement(content);
                            });
                        }
                        return render(view.$el, instance, true);
                    },
                    url: url,
                    name: name,
                    compiled: compiled
                };
                onLoad(out);
            });
        }
    };
});