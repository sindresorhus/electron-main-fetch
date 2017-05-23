import electron from 'electron';
import test from 'ava';
import execa from 'execa';

test(async t => {
	const result = await execa.stdout(electron, ['fixture.js'], {
		env: {
			ELECTRON_ENABLE_LOGGING: true,
			ELECTRON_ENABLE_STACK_DUMPING: true,
			ELECTRON_NO_ATTACH_CONSOLE: true
		}
	});

	t.is(result, 'bar');
});
