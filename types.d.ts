
interface GetAccessTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  user_id: string;
  screen_name: string;
}

interface GetAccessTokenRequest {
  oauth_token: string;
  oauth_verifier: string;
}

interface OAuthToken {
  oauth_token: string;
  oauth_token_secret: string;
}

interface HttpConfigParam {
  method: 'get'|'post'|'put'|'patch'|'delete'
  params?: { [key: string]: string|number|boolean };
  body?: Object;
  oauth?: import('request').OAuthOptions;
}

interface User {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: null;
  entities: Entities;
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  created_at: string;
  favourites_count: number;
  utc_offset: null;
  time_zone: null;
  geo_enabled: boolean;
  verified: boolean;
  statuses_count: number;
  lang: null;
  contributors_enabled: boolean;
  is_translator: boolean;
  is_translation_enabled: boolean;
  profile_background_color: string;
  profile_background_image_url: null;
  profile_background_image_url_https: null;
  profile_background_tile: boolean;
  profile_image_url: string;
  profile_image_url_https: string;
  profile_banner_url: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: boolean;
  has_extended_profile: boolean;
  default_profile: boolean;
  default_profile_image: boolean;
  following: boolean;
  follow_request_sent: boolean;
  notifications: boolean;
  translator_type: string;
  withheld_in_countries: any[];
  suspended: boolean;
  needs_phone_verification: boolean;
  email: string;
}

interface Entities {
  description: Description;
}


interface Tweet {
  created_at:                string;
  id:                        number;
  id_str:                    string;
  text:                      string;
  truncated:                 boolean;
  entities:                  any;
  metadata:                  any;
  source:                    string;
  in_reply_to_status_id:     null;
  in_reply_to_status_id_str: null;
  in_reply_to_user_id:       null;
  in_reply_to_user_id_str:   null;
  in_reply_to_screen_name:   null;
  user:                      User;
  geo:                       null;
  coordinates:               null;
  place:                     null;
  contributors:              null;
  is_quote_status:           boolean;
  retweet_count:             number;
  favorite_count:            number;
  favorited:                 boolean;
  retweeted:                 boolean;
  possibly_sensitive:        boolean;
  lang:                      string;
}

interface Media {
  media_id:           number;
  media_id_string:    string;
  media_key:          string;
  size:               number;
  expires_after_secs: number;
  image:              {
    image_type: string;
    w:          number;
    h:          number;
  };
}
