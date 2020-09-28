/**
 * WordPress dependencies
 */
import {
	__experimentalNavigation as Navigation,
	__experimentalNavigationItem as NavigationItem,
	__experimentalNavigationMenu as NavigationMenu,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TemplateSwitcher from './template-switcher';

const NavigationPanel = () => {
	const { templateId, templatePartId, templateType, page } = useSelect(
		( select ) => {
			const {
				getTemplateId,
				getTemplatePartId,
				getTemplateType,
				getPage,
			} = select( 'core/edit-site' );

			return {
				templateId: getTemplateId(),
				templatePartId: getTemplatePartId(),
				templateType: getTemplateType(),
				page: getPage(),
			};
		},
		[]
	);

	const {
		setTemplate,
		addTemplate,
		removeTemplate,
		setTemplatePart,
	} = useDispatch( 'core/edit-site' );

	return (
		<div className="edit-site-navigation-panel">
			<Navigation
				activeItem={
					'wp_template' === templateType
						? `template-${ templateId }`
						: `template-part-${ templatePartId }`
				}
			>
				<NavigationMenu title="Home">
					<NavigationItem
						item="item-back"
						title="Back to dashboard"
						href="index.php"
					/>

					<TemplateSwitcher
						page={ page }
						activeId={ templateId }
						onActiveIdChange={ setTemplate }
						onActiveTemplatePartIdChange={ setTemplatePart }
						onAddTemplate={ addTemplate }
						onRemoveTemplate={ removeTemplate }
					/>
				</NavigationMenu>
			</Navigation>
		</div>
	);
};

export default NavigationPanel;
