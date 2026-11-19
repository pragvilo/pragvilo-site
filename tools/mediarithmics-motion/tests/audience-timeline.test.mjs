import test from 'node:test';
import assert from 'node:assert/strict';
import {audienceMoment,audienceSelections} from '../src/audienceTimeline.ts';

test('cycles to a different prospect every six seconds and loops after three', () => {
  assert.equal(audienceMoment(179).index, 0);
  assert.equal(audienceMoment(180).index, 1);
  assert.equal(audienceMoment(360).index, 2);
  assert.equal(audienceMoment(540).index, 0);
});

test('finishes writing before proposing criteria and revealing the audience', () => {
  assert.equal(audienceMoment(0).step, 'request');
  assert.equal(audienceMoment(45).step, 'request');
  assert.equal(audienceMoment(60).step, 'rules');
  assert.equal(audienceMoment(68).step, 'created');
});

test('the request types progressively and is complete before criteria appear', () => {
  assert.equal(audienceMoment(0).writing, 0);
  assert.equal(audienceMoment(27).writing, .5);
  assert.equal(audienceMoment(54).writing, 1);
  assert.equal(audienceMoment(60).writing, 1);
});

test('each prospect selects a different sized group of valid unique profiles', () => {
  assert.equal(new Set(audienceSelections.map(group=>group.length)).size,3);
  for(const group of audienceSelections){
    assert.equal(new Set(group).size,group.length);
    assert.ok(group.every(profile=>Number.isInteger(profile)&&profile>=0&&profile<12));
  }
});
