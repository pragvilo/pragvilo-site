import test from 'node:test';
import assert from 'node:assert/strict';
import {audienceMoment,audienceSelections} from '../src/audienceTimeline.ts';

test('cycles to a different prospect every six seconds and loops after three', () => {
  assert.equal(audienceMoment(179).index, 0);
  assert.equal(audienceMoment(180).index, 1);
  assert.equal(audienceMoment(360).index, 2);
  assert.equal(audienceMoment(540).index, 0);
});

test('finishes building the audience within one and a half seconds', () => {
  assert.equal(audienceMoment(0).step, 'request');
  assert.equal(audienceMoment(20).step, 'rules');
  assert.equal(audienceMoment(45).step, 'created');
});

test('each prospect selects a different sized group of valid unique profiles', () => {
  assert.equal(new Set(audienceSelections.map(group=>group.length)).size,3);
  for(const group of audienceSelections){
    assert.equal(new Set(group).size,group.length);
    assert.ok(group.every(profile=>Number.isInteger(profile)&&profile>=0&&profile<12));
  }
});
