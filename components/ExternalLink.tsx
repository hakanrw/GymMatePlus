import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, TouchableOpacity, Text } from 'react-native';

// Define the allowed href types from expo-router Link
type LinkHref = ComponentProps<typeof Link>['href'];

// For external links that aren't expo-router paths
export function ExternalLink({
                                 href,
                                 children,
                                 style,
                                 ...rest
                             }: Omit<ComponentProps<typeof Link>, 'href'> & {
    href: string
}) {
    // For web, we can still use Link with the external URL
    if (Platform.OS === 'web') {
        return (
            <Link
                target="_blank"
                {...rest}
                // Cast the href to any to bypass the type checking
                // This is safe for web where external URLs work with Link
                href={href as any}
            >
                {children}
            </Link>
        );
    }

    // For native platforms, use TouchableOpacity instead
    return (
        <TouchableOpacity
            {...rest}
            onPress={async () => {
                await openBrowserAsync(href);
            }}
        >
            {children}
        </TouchableOpacity>
    );
}
