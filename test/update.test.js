const test = require('node:test');
const assert = require('node:assert/strict');
const { runCardUpdate } = require('../src/update');

const svg = '<svg width="420" height="225"></svg>';
const config = {
  github: { owner: 'owner', repo: 'repo', branch: 'main' }
};

test('runCardUpdate publishes both cards in one call', async () => {
  const calls = [];
  const result = await runCardUpdate({
    config,
    generators: {
      'musicCard.svg': async () => svg,
      'steamCard.svg': async () => svg
    },
    publisher: {
      async publish(input) {
        calls.push(input);
        return { changed: true, commitSha: 'commit' };
      }
    }
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].files, {
    'musicCard.svg': svg,
    'steamCard.svg': svg
  });
  assert.equal(result.commitSha, 'commit');
});

test('runCardUpdate never publishes when one generator fails', async () => {
  let publishCalls = 0;

  await assert.rejects(() =>
    runCardUpdate({
      config,
      generators: {
        'musicCard.svg': async () => svg,
        'steamCard.svg': async () => {
          throw new Error('steam unavailable');
        }
      },
      publisher: {
        async publish() {
          publishCalls += 1;
        }
      }
    })
  );

  assert.equal(publishCalls, 0);
});

test('runCardUpdate rejects empty or malformed card artifacts', async () => {
  let publishCalls = 0;

  await assert.rejects(
    () =>
      runCardUpdate({
        config,
        generators: {
          'musicCard.svg': async () => '',
          'steamCard.svg': async () => svg
        },
        publisher: {
          async publish() {
            publishCalls += 1;
          }
        }
      }),
    /musicCard\.svg/
  );

  assert.equal(publishCalls, 0);
});
