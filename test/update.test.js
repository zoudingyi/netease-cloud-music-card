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

for (const failedFile of ['musicCard.svg', 'steamCard.svg']) {
  test(`runCardUpdate publishes the other card when ${failedFile} fails`, async () => {
    const failure = new Error('platform unavailable');
    const calls = [];
    const generators = {
      'musicCard.svg': async () => svg,
      'steamCard.svg': async () => svg
    };
    generators[failedFile] = () => {
      throw failure;
    };
    const result = await runCardUpdate({
      config,
      generators,
      publisher: {
        async publish(input) {
          calls.push(input);
          return { changed: true, commitSha: 'commit' };
        }
      }
    });
    const successfulFile = Object.keys(generators).find(
      (file) => file !== failedFile
    );
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].files, { [successfulFile]: svg });
    assert.deepEqual(result.failures, [
      { filename: failedFile, error: failure }
    ]);
    assert.equal(result.changed, true);
  });
}

for (const invalidSvg of ['', '<svg></svg>']) {
  test(`runCardUpdate skips invalid SVG ${JSON.stringify(invalidSvg)} even when the other card is unchanged`, async () => {
    const result = await runCardUpdate({
      config,
      generators: {
        'musicCard.svg': async () => invalidSvg,
        'steamCard.svg': async () => svg
      },
      publisher: {
        async publish(input) {
          assert.deepEqual(input.files, { 'steamCard.svg': svg });
          return { changed: false, commitSha: 'head' };
        }
      }
    });
    assert.equal(result.changed, false);
    assert.equal(result.failures[0].filename, 'musicCard.svg');
    assert.match(result.failures[0].error.message, /musicCard\.svg/);
  });
}

test('runCardUpdate never publishes when all generators fail', async () => {
  let publishCalls = 0;
  await assert.rejects(
    () =>
      runCardUpdate({
        config,
        generators: {
          'musicCard.svg': async () => {
            throw new Error('music unavailable');
          },
          'steamCard.svg': async () => {
            throw new Error('steam unavailable');
          }
        },
        publisher: {
          async publish() {
            publishCalls += 1;
          }
        }
      }),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.match(error.message, /musicCard\.svg/);
      assert.match(error.message, /steamCard\.svg/);
      assert.equal(error.errors.length, 2);
      return true;
    }
  );
  assert.equal(publishCalls, 0);
});

test('runCardUpdate propagates publishing failure after partial generation', async () => {
  const failure = new Error('publish failed');
  await assert.rejects(
    () =>
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
            throw failure;
          }
        }
      }),
    (error) => error === failure
  );
});
