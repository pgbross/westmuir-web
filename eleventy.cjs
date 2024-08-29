const litPlugin = require('@lit-labs/eleventy-plugin-lit');
const inlineCss = require('./eleventy-helpers/shortcodes/inline-css.cjs');
const inlineJS = require('./eleventy-helpers/shortcodes/inline-js.cjs');
const minifyHTML = require('./eleventy-helpers/transforms/minify-html.cjs');

// dev mode build
const DEV = process.env.NODE_ENV === 'DEV';
// where the JS files are outputted
const jsDir = DEV ? 'lib' : 'build';
// where to output 11ty output
const outputFolder = DEV ? '_dev' : '_prod';

module.exports = function (eleventyConfig) {
  eleventyConfig
    .addPassthroughCopy('site/images')
    .addPassthroughCopy('site/favicon.ico')
    .addPassthroughCopy('site/PDF Pages')
    .addPassthroughCopy('site/Walk of the Month')
    .addPassthroughCopy('site/videos')
    .addPassthroughCopy('site/css/*.css')
    .addPassthroughCopy({ [`${jsDir}/`]: 'js/' });

  // add the lit-ssr plugin
  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: [`./${jsDir}/ssr.js`],
  });

  // Add this for 11ty's --watch flag
  eleventyConfig.addWatchTarget(`./${jsDir}/**/*.js`);

  // install shortcodes
  inlineCss(eleventyConfig, DEV);
  inlineJS(eleventyConfig, DEV, { jsDir });

  eleventyConfig.addLayoutAlias('default', 'layouts/base.html');

  // install transforms
  minifyHTML(eleventyConfig, DEV);

  eleventyConfig.addGlobalData('permalink', () => {
    return data => `${data.page.filePathStem}.${data.page.outputFileExtension}`;
  });

  return {
    templateFormats: ['md', 'html', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'site',
      output: outputFolder,
    },
  };
};
