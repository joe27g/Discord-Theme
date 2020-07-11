const Plugin = require('../plugin');
const DEBUG = true;
const IGNORE_EXTRA_CLASSES = true;

module.exports = new Plugin({
    name: 'CSS Updater',
    author: 'Joe 🎸#7070',
    description: `Finds differences between local modules and theme classes.`,
    color: 'gray',

    load: async function () {
        const content = await fetch('https://enhanceddiscord.com/theme.css').then(res => res.text()).catch(this.error);
        if (!content) {
            if (DEBUG) this.warn('failed to get theme text');
            return;
        }

        const lines = content.split(/[\r\n][\r\n]?/).filter(l => l);
        if (DEBUG) this.info(`Read theme with ${lines.length} lines`);
        let numInspected = 0;
        for (let i in lines) {
            i = parseInt(i); // fuck you, JS
            if (lines[i] && lines[i + 1] && /\(([^:[\]]+):([^)]+)\)/.test(lines[i]) && /^\s*[^{]+\s*{\s*\/\*\*\/\s*$/.test(lines[i + 1])) {
                const moduleGroups = lines[i].match(/\(([^:]+):([^)]+)\)/g);
                if (!moduleGroups) {
                    if (DEBUG) this.info(`line ${i} matched but had no moduleGroups`);
                    continue;
                }
                const template = lines[i].replace(/^\s*\/\*\s*/, '').replace(/\s*\*\/\s*$/, '');
                const selector = lines[i + 1].replace(/\s*{\s*\/\*\*\/\s*$/, '').trim();
                let replacedSelector = template;

                let badLine = true;
                for (let j in moduleGroups) {
                    j = parseInt(j); // fuck you, JS
                    const matches = moduleGroups[j].match(/^\(([^:]+):([^)]+)\)$/);
                    if (!matches) {
                        if (DEBUG) this.info(`Line ${i} group ${j} - ${moduleGroups[j]} did not match`);
                        continue;
                    }
                    const moduleName = matches[1], propertyName = matches[2];
                    let mod = EDApi.findModule(moduleName);
                    if (/\[[^\]]+\]/.test(moduleName)) {
                        const propNames = moduleName.replace(/\[\]/, '').split(',');
                        if (propNames.length > 1) {
                            mod = EDApi.findModule(m => {
                                for (const k in propNames) {
                                    let prop = propNames[k];
                                    let negate = false;
                                    if (prop.startsWith('!')) {
                                        negate = true;
                                        prop = prop.substr(1);
                                    }
                                    return (negate && !m[prop]) || (!negate && m[prop]);
                                }
                            });
                        }
                    }
                    if (!mod) {
                        this.error(`Could not find module "${moduleName}" ~ line ${i}...\n${lines[i]}\n${lines[i + 1]}`);
                        continue;
                    }
                    if (!mod[propertyName] || typeof mod[propertyName] !== 'string') {
                        this.warn(`Could not find property "${propertyName}" in module "${moduleName}" ~ line ${i}...\n${lines[i]}\n${lines[i + 1]}`);
                        continue;
                    }
                    badLine = false;
                    let preClass = '.' + mod[propertyName];
                    if (preClass.includes(' ') && IGNORE_EXTRA_CLASSES) {
                        preClass = preClass.split(' ')[0];
                    }
                    const className = preClass.replace(/ /g, '.'); // join classes with . instead of space
                    replacedSelector = replacedSelector.replace(moduleGroups[j], className);
                }
                if (badLine) continue; // don't show double errors
                if (selector !== replacedSelector) {
                    this.log(`Selector difference found on lines ${i}/${i + 1}:\nTemplate: ${template}\n\n${selector}\ndiffers from:\n${replacedSelector}`)
                }
                numInspected++;
            }
        }
        if (DEBUG) this.info(`Found ${numInspected} lines with problems or replacable selectors`);
    },
    unload: async function () { }
});
