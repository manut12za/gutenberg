/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	createNewPost,
	deactivatePlugin,
	getAllBlockInserterItemTitles,
	insertBlock,
	openGlobalBlockInserter,
	closeGlobalBlockInserter,
} from '@wordpress/e2e-test-utils';

describe( 'Allowed Blocks Setting on InnerBlocks ', () => {
	const paragraphSelector =
		'.block-editor-rich-text__editable[data-type="core/paragraph"]';
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-innerblocks-allowed-blocks' );
	} );

	beforeEach( async () => {
		await createNewPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-innerblocks-allowed-blocks' );
	} );

	it( 'allows all blocks if the allowed blocks setting was not set', async () => {
		const frame = await page
			.frames()
			.find( ( f ) => f.name() === 'editor-content' );
		const parentBlockSelector = '[data-type="test/allowed-blocks-unset"]';
		const childParagraphSelector = `${ parentBlockSelector } ${ paragraphSelector }`;
		await insertBlock( 'Allowed Blocks Unset' );
		await closeGlobalBlockInserter();
		await frame.waitForSelector( childParagraphSelector );
		await frame.click( childParagraphSelector );
		await openGlobalBlockInserter();
		await expect(
			( await getAllBlockInserterItemTitles() ).length
		).toBeGreaterThan( 20 );
	} );

	it( 'allows the blocks if the allowed blocks setting was set', async () => {
		const frame = await page
			.frames()
			.find( ( f ) => f.name() === 'editor-content' );
		const parentBlockSelector = '[data-type="test/allowed-blocks-set"]';
		const childParagraphSelector = `${ parentBlockSelector } ${ paragraphSelector }`;
		await insertBlock( 'Allowed Blocks Set' );
		await closeGlobalBlockInserter();
		await frame.waitForSelector( childParagraphSelector );
		await frame.click( childParagraphSelector );
		await openGlobalBlockInserter();
		expect( await getAllBlockInserterItemTitles() ).toEqual( [
			'Button',
			'Gallery',
			'List',
			'Media & Text',
			'Quote',
		] );
	} );

	it( 'correctly applies dynamic allowed blocks restrictions', async () => {
		await insertBlock( 'Allowed Blocks Dynamic' );
		await closeGlobalBlockInserter();
		const parentBlockSelector = '[data-type="test/allowed-blocks-dynamic"]';
		const blockAppender = '.block-list-appender button';
		const appenderSelector = `${ parentBlockSelector } ${ blockAppender }`;
		const frame = await page
			.frames()
			.find( ( f ) => f.name() === 'editor-content' );
		await frame.waitForSelector( appenderSelector );
		await frame.click( appenderSelector );
		expect( await getAllBlockInserterItemTitles() ).toEqual( [
			'Image',
			'List',
		] );
		const insertButton = (
			await page.$x( `//button//span[contains(text(), 'List')]` )
		 )[ 0 ];
		await insertButton.click();
		await insertBlock( 'Image' );
		await closeGlobalBlockInserter();
		await frame.waitForSelector( '.product[data-number-of-children="2"]' );
		await frame.click( appenderSelector );
		expect( await getAllBlockInserterItemTitles() ).toEqual( [
			'Gallery',
			'Video',
		] );
	} );
} );
