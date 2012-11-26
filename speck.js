define(['jquery', 'backbone', 'marionette', 'module', 'text', 'dustjs-linkedin'],
function($, Backbone, Marionette, module, text, dust) {

    var masterConfig = module.config();

    return {

        load: function(name, req, onLoad, config) {
            var url = name,
                template = Marionette.TemplateCache.get(name);

            if (!template) {
                if(masterConfig && 'speckUrl' in masterConfig && url[0] !== '.'){
                    url = masterConfig.speckUrl + url;
                }
                if (url.indexOf('.dust', url.length - 5) === -1) {
                    url = url + '.dust';
                }
            }

            var processTemplate = function(data, precompiled) {
                var compiled;
                if (precompiled) {
                    compiled = data;
                } else {
                    compiled = dust.compile(data, name);
                    Marionette.TemplateCache.cache(compiled, name);
                }

                dust.loadSource(compiled);

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
                    // Modified: now takes an optional fourth param (defaults to false) that determines
                    // whether or not the call to HTML updates the UI as well as returning the markup, and
                    // a required third param that is the view (so the template can access view methods)
                    html: function(element, view, update) {
                        var updateUi = update || false,
                            context = dust.makeBase(view),
                            data = view.mixinTemplateHelpers.call(view, view.serializeData()),
                            instance = context.push(data);
                        // Modified: added normalization to call
                        return render(element, instance, updateUi);
                    },
                    view: function(view, replace){
                        // Marionette views have a serializeData method that determines
                        // which data should be attached to the view
                        var data = view.mixinTemplateHelpers.call(view, view.serializeData()),
                            context = dust.makeBase(view),
                            instance = context.push(data);

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
            }
            //TODO: Perhaps hook this up to marionette's template cache?
            if (template) {
                processTemplate(template, true);
            } else {
                text.get(req.toUrl(url), processTemplate);
            }
        }
    };
});