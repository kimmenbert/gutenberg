/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Icon, chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../../button';
import { useNavigationContext } from '../context';
import { useNavigationTreeItem } from './use-navigation-tree-item';
import { ItemBadgeUI, ItemTitleUI, ItemUI } from '../styles/navigation-styles';

export default function NavigationItem( props ) {
	const {
		badge,
		children,
		className,
		href,
		item,
		navigateToMenu,
		onClick = noop,
		title,
		...restProps
	} = props;
	useNavigationTreeItem( props );
	const {
		activeItem,
		navigationTree,
		setActiveMenu,
	} = useNavigationContext();

	if ( ! navigationTree.getItem( item )?._isVisible ) {
		return null;
	}

	const classes = classnames( 'components-navigation__item', className, {
		'is-active': item && activeItem === item,
	} );

	const onItemClick = ( event ) => {
		if ( navigateToMenu ) {
			setActiveMenu( navigateToMenu );
		}

		onClick( event );
	};

	return (
		<ItemUI className={ classes } role="listitem">
			{ children || (
				<Button href={ href } onClick={ onItemClick } { ...restProps }>
					{ title && (
						<ItemTitleUI
							className="components-navigation__item-title"
							variant="body.small"
							as="span"
						>
							{ title }
						</ItemTitleUI>
					) }

					{ badge && (
						<ItemBadgeUI className="components-navigation__item-badge">
							{ badge }
						</ItemBadgeUI>
					) }

					{ navigateToMenu && <Icon icon={ chevronRight } /> }
				</Button>
			) }
		</ItemUI>
	);
}
