# Requirements Document - IGDB Integration

## Introduction

The IGDB Integration feature enables users to automatically fetch game information and cover art from the Internet Game Database (IGDB) API when adding games to their collection. This feature streamlines the game entry process by eliminating manual cover image uploads and ensuring accurate game titles and metadata. The integration uses Twitch OAuth for authentication and provides a search interface within the game form.

## Glossary

- **IGDB**: Internet Game Database - A comprehensive video game database API owned by Twitch
- **Twitch OAuth**: Authentication system required to access IGDB API
- **Access Token**: Time-limited credential obtained from Twitch for IGDB API access
- **Cover Art**: The official box art or promotional image for a video game
- **Game Search**: The process of querying IGDB for games matching user input
- **Auto-fill**: Automatic population of form fields based on selected IGDB data
- **Rate Limit**: Maximum number of API requests allowed per time period (4 requests/second for IGDB)
- **API Route**: Server-side endpoint that handles IGDB requests securely
- **Search Dialog**: Modal interface displaying IGDB search results

## Requirements

### Requirement 1: IGDB API Authentication

**User Story:** As a system administrator, I want the application to securely authenticate with IGDB API, so that users can access game data without exposing credentials.

#### Acceptance Criteria

1. THE RakGame System SHALL store Twitch Client ID and Client Secret as environment variables
2. WHEN the system needs to access IGDB, THE RakGame System SHALL obtain an OAuth access token from Twitch
3. THE RakGame System SHALL refresh the access token when it expires
4. THE RakGame System SHALL handle authentication failures gracefully with user-friendly error messages
5. THE RakGame System SHALL NOT expose API credentials to the client-side code

### Requirement 2: Game Search Interface

**User Story:** As a user adding a game, I want to search IGDB for my game title, so that I can quickly find the correct game and its cover art.

#### Acceptance Criteria

1. THE RakGame System SHALL provide a "Search IGDB" button next to the game title field
2. WHEN a user clicks the search button, THE RakGame System SHALL open a search dialog within 500 milliseconds
3. THE RakGame System SHALL search IGDB using the entered game title as the query
4. WHEN search results are available, THE RakGame System SHALL display up to 10 matching games with cover images
5. THE RakGame System SHALL show game title, platform, and release year for each search result
6. WHEN no results are found, THE RakGame System SHALL display a clear "No games found" message

### Requirement 3: Search Results Display

**User Story:** As a user searching for a game, I want to see visual results with cover images, so that I can identify the correct game easily.

#### Acceptance Criteria

1. THE RakGame System SHALL display each search result as a card with cover image, title, and metadata
2. WHEN a cover image is available, THE RakGame System SHALL display it at 264x352 pixels (IGDB cover_big size)
3. WHEN a cover image is unavailable, THE RakGame System SHALL display a placeholder image
4. THE RakGame System SHALL show platform icons or names for each game result
5. THE RakGame System SHALL display release year if available
6. THE RakGame System SHALL make each result card clickable for selection

### Requirement 4: Game Selection and Auto-fill

**User Story:** As a user, I want to select a game from search results and have its cover automatically added, so that I don't need to manually upload images.

#### Acceptance Criteria

1. WHEN a user selects a game from search results, THE RakGame System SHALL close the search dialog
2. THE RakGame System SHALL automatically populate the cover image field with the selected game's cover art
3. THE RakGame System SHALL update the game title field with the official IGDB title
4. THE RakGame System SHALL preserve user-entered data in other fields (price, purchase date, etc.)
5. THE RakGame System SHALL allow users to manually change or remove the auto-filled cover image

### Requirement 5: Error Handling and Fallbacks

**User Story:** As a user, I want the system to handle API failures gracefully, so that I can still add games manually if IGDB is unavailable.

#### Acceptance Criteria

1. WHEN IGDB API is unavailable, THE RakGame System SHALL display an error message and allow manual entry
2. WHEN API rate limit is exceeded, THE RakGame System SHALL inform the user to wait and retry
3. WHEN network errors occur, THE RakGame System SHALL provide a clear error message
4. THE RakGame System SHALL maintain the manual upload option as a fallback
5. WHEN search fails, THE RakGame System SHALL log the error for debugging without exposing technical details to users

### Requirement 6: Performance and Caching

**User Story:** As a user, I want search results to load quickly, so that adding games is efficient.

#### Acceptance Criteria

1. THE RakGame System SHALL return search results within 2 seconds under normal conditions
2. THE RakGame System SHALL respect IGDB rate limits (4 requests per second)
3. THE RakGame System SHALL cache OAuth access tokens until expiration
4. THE RakGame System SHALL show a loading indicator during search operations
5. THE RakGame System SHALL allow users to cancel ongoing searches

### Requirement 7: Multi-language Support

**User Story:** As a Thai user, I want the IGDB search interface in Thai language, so that I can use it comfortably.

#### Acceptance Criteria

1. THE RakGame System SHALL display all IGDB search UI elements in the user's selected language (Thai or English)
2. THE RakGame System SHALL translate button labels, error messages, and dialog titles
3. THE RakGame System SHALL display game titles from IGDB in their original language
4. THE RakGame System SHALL maintain consistent translation quality with the rest of the application
