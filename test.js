import electron from 'electron';
import test from 'ava';
import execa from 'execa';

test('main', async t => {
	const result = await execa(electron, ['fixture.js'], {
		env: {
			ELECTRON_ENABLE_LOGGING: true,
			ELECTRON_ENABLE_STACK_DUMPING: true,
			ELECTRON_NO_ATTACH_CONSOLE: true
		}
	});

	console.log(result.stdout);

	t.pass();
});
