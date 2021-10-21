
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src\components\CompareOdds.svelte generated by Svelte v3.43.1 */

    function create_fragment$1(ctx) {
    	let table;

    	return {
    		c() {
    			table = element("table");

    			table.innerHTML = `<caption id="caption" class="svelte-1r9s8q9">Baseball numbers mmkay.</caption> 
    <thead><tr><th class="svelte-1r9s8q9">Teams</th> 
        <th class="svelte-1r9s8q9">1</th> 
        <th class="svelte-1r9s8q9">2</th> 
        <th class="svelte-1r9s8q9">3</th> 
        <th class="svelte-1r9s8q9">4</th> 
        <th class="svelte-1r9s8q9">5</th> 
        <th class="svelte-1r9s8q9">6</th> 
        <th class="svelte-1r9s8q9">7</th> 
        <th class="svelte-1r9s8q9">8</th> 
        <th class="svelte-1r9s8q9">9</th> 
        <th class="svelte-1r9s8q9">Runs</th></tr></thead> 
    <tbody><tr><th class="svelte-1r9s8q9">Milwaukee Brewers</th> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">21</td></tr> 
      <tr><th class="svelte-1r9s8q9">Los Angles Dodgers</th> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">15</td></tr> 
      <tr><th class="svelte-1r9s8q9">New York Mets</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">13</td></tr> 
      <tr><th class="svelte-1r9s8q9">St. Louis Cardinals</th> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">16</td></tr> 
      <tr><th class="svelte-1r9s8q9">Houston Astros</th> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">24</td></tr> 
      <tr><th class="svelte-1r9s8q9">Toronto Blue Jays</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">19</td></tr> 
      <tr><th class="svelte-1r9s8q9">Boston Red Sox</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">20</td></tr> 
      <tr><th class="svelte-1r9s8q9">Chicago Cubs</th> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">11</td></tr> 
      <tr><th class="svelte-1r9s8q9">Philadelphia Phillies</th> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">21</td></tr> 
      <tr><th class="svelte-1r9s8q9">Chicago White Sox</th> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">15</td></tr> 
      <tr><th class="svelte-1r9s8q9">San Diego Padres</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">10</td></tr> 
      <tr><th class="svelte-1r9s8q9">Cleveland Indians</th> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">19</td></tr> 
      <tr><th class="svelte-1r9s8q9">San Francisco Giants</th> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">9</td></tr> 
      <tr><th class="svelte-1r9s8q9">Cincinatti Reds</th> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">26</td></tr> 
      <tr><th class="svelte-1r9s8q9">Minnesota Twins</th> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">21</td></tr> 
      <tr><th class="svelte-1r9s8q9">Tampa Bay Rays</th> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">13</td></tr> 
      <tr><th class="svelte-1r9s8q9">Miami Marlins</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">15</td></tr> 
      <tr><th class="svelte-1r9s8q9">Oakland Athletics</th> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">16</td></tr> 
      <tr><th class="svelte-1r9s8q9">Detroit Tigers</th> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">26</td></tr> 
      <tr><th class="svelte-1r9s8q9">Pittsburgh Pirates</th> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">15</td></tr> 
      <tr><th class="svelte-1r9s8q9">Seattle Mariners</th> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">0</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">17</td></tr> 
      <tr><th class="svelte-1r9s8q9">Atlanta Braves</th> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">2</td> 
        <td class="svelte-1r9s8q9">3</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">1</td> 
        <td class="svelte-1r9s8q9">4</td> 
        <td class="svelte-1r9s8q9">25</td></tr></tbody>`;

    			attr(table, "class", "oddstable svelte-1r9s8q9");
    		},
    		m(target, anchor) {
    			insert(target, table, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(table);
    		}
    	};
    }

    class CompareOdds extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.1 */

    function create_fragment(ctx) {
    	let style;
    	let t1;
    	let compareodds;
    	let current;
    	compareodds = new CompareOdds({});

    	return {
    		c() {
    			style = element("style");
    			style.textContent = ".oddstable.svelte-1r9s8q9.svelte-1r9s8q9{font-size:125%;white-space:nowrap;margin:0;border:none;border-collapse:separate;border-spacing:0;table-layout:fixed;border:1px solid black;min-width:1500px}.oddstable.svelte-1r9s8q9 td.svelte-1r9s8q9,.oddstable.svelte-1r9s8q9 th.svelte-1r9s8q9{border:1px solid black;padding:0.5rem 1rem}.oddstable.svelte-1r9s8q9 thead th.svelte-1r9s8q9{padding:3px;position:sticky;top:0;z-index:1;width:25vw;background:white}.oddstable.svelte-1r9s8q9 td.svelte-1r9s8q9{background:#fff;padding:4px 5px;text-align:center}.oddstable.svelte-1r9s8q9 tbody th.svelte-1r9s8q9{font-weight:100;font-style:italic;text-align:left;position:relative}.oddstable.svelte-1r9s8q9 thead th.svelte-1r9s8q9:first-child{position:sticky;left:0;z-index:2}.oddstable.svelte-1r9s8q9 tbody th.svelte-1r9s8q9{position:sticky;left:0;background:white;z-index:1}.oddstable.svelte-1r9s8q9 caption.svelte-1r9s8q9{text-align:left;padding:0.25rem;position:sticky;left:0}";
    			t1 = space();
    			create_component(compareodds.$$.fragment);
    		},
    		m(target, anchor) {
    			append(document.head, style);
    			insert(target, t1, anchor);
    			mount_component(compareodds, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(compareodds.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(compareodds.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			detach(style);
    			if (detaching) detach(t1);
    			destroy_component(compareodds, detaching);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.querySelector('#odds-compare')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
