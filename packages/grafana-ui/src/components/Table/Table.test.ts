import _ from 'lodash';

import { getColorDefinitionByName } from '@grafana/ui';
import { ScopedVars } from '@grafana/ui/src/types';
import { getTheme } from '../../themes';

import { migratedTestTable, migratedTestStyles } from './examples';
import TableXXXX from './TableXXXX';

// TODO: this is commented out with *x* describe!
// Essentially all the elements need to replace the <td> with <div>
xdescribe('when rendering table', () => {
  const SemiDarkOrange = getColorDefinitionByName('semi-dark-orange');

  describe('given 13 columns', () => {
    // const sanitize = value => {
    //   return 'sanitized';
    // };

    const replaceVariables = (value: any, scopedVars: ScopedVars | undefined) => {
      if (scopedVars) {
        // For testing variables replacement in link
        _.each(scopedVars, (val, key) => {
          value = value.replace('$' + key, val.value);
        });
      }
      return value;
    };

    const table = migratedTestTable;
    const renderer = new TableXXXX({
      styles: migratedTestStyles,
      data: migratedTestTable,
      replaceVariables,
      showHeader: true,
      width: 100,
      height: 100,
      theme: getTheme(),
    });

    it('time column should be formated', () => {
      const html = renderer.renderCell(0, 0, 1388556366666);
      expect(html).toBe('<td>2014-01-01T06:06:06Z</td>');
    });

    it('time column with epoch as string should be formatted', () => {
      const html = renderer.renderCell(0, 0, '1388556366666');
      expect(html).toBe('<td>2014-01-01T06:06:06Z</td>');
    });

    it('time column with RFC2822 date as string should be formatted', () => {
      const html = renderer.renderCell(0, 0, 'Sat, 01 Dec 2018 01:00:00 GMT');
      expect(html).toBe('<td>2018-12-01T01:00:00Z</td>');
    });

    it('time column with ISO date as string should be formatted', () => {
      const html = renderer.renderCell(0, 0, '2018-12-01T01:00:00Z');
      expect(html).toBe('<td>2018-12-01T01:00:00Z</td>');
    });

    it('undefined time column should be rendered as -', () => {
      const html = renderer.renderCell(0, 0, undefined);
      expect(html).toBe('<td>-</td>');
    });

    it('null time column should be rendered as -', () => {
      const html = renderer.renderCell(0, 0, null);
      expect(html).toBe('<td>-</td>');
    });

    it('number column with unit specified should ignore style unit', () => {
      const html = renderer.renderCell(5, 0, 1230);
      expect(html).toBe('<td>1.23 kbps</td>');
    });

    it('number column should be formated', () => {
      const html = renderer.renderCell(1, 0, 1230);
      expect(html).toBe('<td>1.230 s</td>');
    });

    it('number style should ignore string values', () => {
      const html = renderer.renderCell(1, 0, 'asd');
      expect(html).toBe('<td>asd</td>');
    });

    it('colored cell should have style (handles HEX color values)', () => {
      const html = renderer.renderCell(2, 0, 40);
      expect(html).toBe('<td style="color:#00ff00">40.0</td>');
    });

    it('colored cell should have style (handles named color values', () => {
      const html = renderer.renderCell(2, 0, 55);
      expect(html).toBe(`<td style="color:${SemiDarkOrange.variants.dark}">55.0</td>`);
    });

    it('colored cell should have style handles(rgb color values)', () => {
      const html = renderer.renderCell(2, 0, 85);
      expect(html).toBe('<td style="color:rgb(1,0,0)">85.0</td>');
    });

    it('unformated undefined should be rendered as string', () => {
      const html = renderer.renderCell(3, 0, 'value');
      expect(html).toBe('<td>value</td>');
    });

    it('string style with escape html should return escaped html', () => {
      const html = renderer.renderCell(4, 0, '&breaking <br /> the <br /> row');
      expect(html).toBe('<td>&amp;breaking &lt;br /&gt; the &lt;br /&gt; row</td>');
    });

    it('undefined formater should return escaped html', () => {
      const html = renderer.renderCell(3, 0, '&breaking <br /> the <br /> row');
      expect(html).toBe('<td>&amp;breaking &lt;br /&gt; the &lt;br /&gt; row</td>');
    });

    it('undefined value should render as -', () => {
      const html = renderer.renderCell(3, 0, undefined);
      expect(html).toBe('<td></td>');
    });

    it('sanitized value should render as', () => {
      const html = renderer.renderCell(6, 0, 'text <a href="http://google.com">link</a>');
      expect(html).toBe('<td>sanitized</td>');
    });

    it('Time column title should be Timestamp', () => {
      expect(table.columns[0].title).toBe('Timestamp');
    });

    it('Value column title should be Val', () => {
      expect(table.columns[1].title).toBe('Val');
    });

    it('Colored column title should be Colored', () => {
      expect(table.columns[2].title).toBe('Colored');
    });

    it('link should render as', () => {
      const html = renderer.renderCell(7, 0, 'host1');
      const expectedHtml = `
        <td class="table-panel-cell-link">
          <a href="/dashboard?param=host1&param_1=1230&param_2=40"
            target="_blank" data-link-tooltip data-original-title="host1 1230 my.host.com" data-placement="right">
            host1
          </a>
        </td>
      `;
      expect(normalize(html + '')).toBe(normalize(expectedHtml));
    });

    it('Array column should not use number as formatter', () => {
      const html = renderer.renderCell(8, 0, ['value1', 'value2']);
      expect(html).toBe('<td>value1, value2</td>');
    });

    it('numeric value should be mapped to text', () => {
      const html = renderer.renderCell(9, 0, 1);
      expect(html).toBe('<td>on</td>');
    });

    it('string numeric value should be mapped to text', () => {
      const html = renderer.renderCell(9, 0, '0');
      expect(html).toBe('<td>off</td>');
    });

    it('string value should be mapped to text', () => {
      const html = renderer.renderCell(9, 0, 'HELLO WORLD');
      expect(html).toBe('<td>HELLO GRAFANA</td>');
    });

    it('array column value should be mapped to text', () => {
      const html = renderer.renderCell(9, 0, ['value1', 'value2']);
      expect(html).toBe('<td>value3, value4</td>');
    });

    it('value should be mapped to text (range)', () => {
      const html = renderer.renderCell(10, 0, 2);
      expect(html).toBe('<td>on</td>');
    });

    it('value should be mapped to text (range)', () => {
      const html = renderer.renderCell(10, 0, 5);
      expect(html).toBe('<td>off</td>');
    });

    it('array column value should not be mapped to text', () => {
      const html = renderer.renderCell(10, 0, ['value1', 'value2']);
      expect(html).toBe('<td>value1, value2</td>');
    });

    it('value should be mapped to text and colored cell should have style', () => {
      const html = renderer.renderCell(11, 0, 1);
      expect(html).toBe(`<td style="color:${SemiDarkOrange.variants.dark}">on</td>`);
    });

    it('value should be mapped to text and colored cell should have style', () => {
      const html = renderer.renderCell(11, 0, '1');
      expect(html).toBe(`<td style="color:${SemiDarkOrange.variants.dark}">on</td>`);
    });

    it('value should be mapped to text and colored cell should have style', () => {
      const html = renderer.renderCell(11, 0, 0);
      expect(html).toBe('<td style="color:#00ff00">off</td>');
    });

    it('value should be mapped to text and colored cell should have style', () => {
      const html = renderer.renderCell(11, 0, '0');
      expect(html).toBe('<td style="color:#00ff00">off</td>');
    });

    it('value should be mapped to text and colored cell should have style', () => {
      const html = renderer.renderCell(11, 0, '2.1');
      expect(html).toBe('<td style="color:rgb(1,0,0)">2.1</td>');
    });

    it('value should be mapped to text (range) and colored cell should have style', () => {
      const html = renderer.renderCell(12, 0, 0);
      expect(html).toBe('<td style="color:#00ff00">0</td>');
    });

    it('value should be mapped to text (range) and colored cell should have style', () => {
      const html = renderer.renderCell(12, 0, 1);
      expect(html).toBe('<td style="color:#00ff00">on</td>');
    });

    it('value should be mapped to text (range) and colored cell should have style', () => {
      const html = renderer.renderCell(12, 0, 4);
      expect(html).toBe(`<td style="color:${SemiDarkOrange.variants.dark}">off</td>`);
    });

    it('value should be mapped to text (range) and colored cell should have style', () => {
      const html = renderer.renderCell(12, 0, '7.1');
      expect(html).toBe('<td style="color:rgb(1,0,0)">7.1</td>');
    });
  });
});

function normalize(str: string) {
  return str.replace(/\s+/gm, ' ').trim();
}
