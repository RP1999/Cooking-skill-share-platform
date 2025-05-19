import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaRegBookmark, 
  FaBookmark, 
  FaShare, 
  FaClock, 
  FaUtensils, 
  FaFire,
  FaClipboardList // Add this new icon
} from 'react-icons/fa';
import { formatTimeAgo } from '../utils/helpers';

const RecipeCard = ({ 
  post, 
  user, 
  isLiked, 
  isBookmarked, 
  commentsCount = 0,
  likeCount = 0,
  onLike, 
  onBookmark, 
  onComment, 
  onShare,
  onDelete
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  
  // Helper to truncate text
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'secondary';
    }
  };
  
  // Helper to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };
  
  const renderMedia = () => {
    // Multiple media items
    if (post.mediaLinks && post.mediaLinks.length > 0) {
      return (
        <div className="recipe-media-gallery">
          {post.mediaLinks.map((mediaLink, index) => {
            const mediaType = post.mediaTypes && post.mediaTypes[index];
            
            // YouTube videos
            if ((mediaType && mediaType === 'video/youtube') || 
                (mediaLink && (mediaLink.includes('youtube.com') || mediaLink.includes('youtu.be')))) {
              const embedUrl = getYouTubeEmbedUrl(mediaLink);
              return (
                <iframe
                  key={index}
                  src={embedUrl}
                  title={`YouTube video ${index}`}
                  allowFullScreen
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              );
            }
            // Regular videos
            else if (mediaType && mediaType.includes('video')) {
              return (
                <div key={index} className="video-preview-container">
                  {!videoError ? (
                    <video 
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      poster={post.thumbnailUrl || ""}
                      onError={() => setVideoError(true)}
                    >
                      <source src={mediaLink} type={mediaType} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="video-error-message">
                      <p>Video could not be loaded</p>
                    </div>
                  )}
                </div>
              );
            }
            // Images
            else {
              return (
                <img
                  key={index}
                  src={mediaLink}
                  alt={`${post.title} ${index + 1}`}
                  className="recipe-media-item"
                  onError={e => { 
                    e.target.src = "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; 
                  }}
                />
              );
            }
          })}
        </div>
      );
    }
    
    // Single media item (fallback)
    if (post.mediaLink) {
      return (
        <div className="recipe-media-gallery">
          {post.mediaLink.includes('youtube.com') || post.mediaLink.includes('youtu.be') ? (
            <iframe
              src={getYouTubeEmbedUrl(post.mediaLink)}
              title="YouTube video"
              allowFullScreen
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : post.mediaType?.includes('video') ? (
            <div className="video-preview-container">
              {!videoError ? (
                <video 
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  poster={post.thumbnailUrl || ""}
                  onError={() => setVideoError(true)}
                >
                  <source src={post.mediaLink} type={post.mediaType} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="video-error-message">
                  <p>Video could not be loaded</p>
                </div>
              )}
            </div>
          ) : (
            <img 
              src={post.mediaLink}
              alt={post.title} 
              className="recipe-media-item"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
          )}
        </div>
      );
    }
    
    // Default image if no media
    return (
      <div className="recipe-media-gallery">
        <img 
          src="https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Default recipe" 
          className="recipe-media-item"
        />
      </div>
    );
  };
  
  return (
    <Card className="recipe-card">
      {/* Recipe Header */}
      <div className="recipe-card-header">
        <div className="recipe-author">
          <div className="recipe-author-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="recipe-author-info">
            <h6 className="author-name">{user?.username || 'Anonymous Chef'}</h6>
            <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
          </div>
        </div>
      </div>
      
      {/* Recipe Media */}
      {renderMedia()}
      
      {/* Recipe Content */}
      <div className="recipe-card-content">
        <h3 className="recipe-title">{post.title}</h3>
        
        {/* Recipe Badges */}
        <div className="recipe-badges">
          {post.cuisineType && (
            <Badge className="recipe-badge cuisine">
              {post.cuisineType}
            </Badge>
          )}
          
          {post.difficultyLevel && (
            <Badge className={`recipe-badge difficulty-${post.difficultyLevel.toLowerCase()}`}>
              <FaFire className="badge-icon" /> {post.difficultyLevel}
            </Badge>
          )}
          
          {post.cookingTime && (
            <Badge className="recipe-badge time">
              <FaClock className="badge-icon" /> {post.cookingTime}
            </Badge>
          )}
        </div>
        
        {/* Recipe Description */}
        <div className="recipe-description">
          {showFullDescription ? (
            <p>{post.contentDescription}</p>
          ) : (
            <p>{truncateText(post.contentDescription, 150)}</p>
          )}
          
          {post.contentDescription && post.contentDescription.length > 150 && (
            <Button 
              variant="link" 
              className="show-more-btn p-0"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>
        
        {/* Recipe Ingredients Preview */}
        {post.ingredients && post.ingredients.length > 0 && (
          <div className="recipe-ingredients-preview">
            <h6 className="ingredients-title">
              <FaUtensils className="me-2" style={{ color: '#ff6b3d' }} /> Ingredients
            </h6>
            <Row>
              {post.ingredients.slice(0, showAllIngredients ? post.ingredients.length : 4).map((ingredient, index) => (
                <Col xs={6} key={index} className="ingredient-item">
                  <span className="ingredient-bullet">•</span> {ingredient}
                </Col>
              ))}
            </Row>
            {post.ingredients.length > 4 && (
              <Button 
                variant="link" 
                className="show-more-ingredients p-0 mt-2"
                onClick={() => setShowAllIngredients(!showAllIngredients)}
              >
                {showAllIngredients ? 'Show less' : `View all ${post.ingredients.length} ingredients`}
              </Button>
            )}
          </div>
        )}

        {/* Recipe Instructions */}
        {post.instructions && (
          <div className="recipe-instructions mt-3">
            <h6 className="instructions-title">
              <FaClipboardList className="me-2" style={{ color: '#ff6b3d' }} /> Instructions
            </h6>
            <p>{post.instructions}</p>
          </div>
        )}
      </div>
      
      {/* Recipe Actions */}
      <div className="recipe-card-actions">
        <div className="action-buttons">
          <Button 
            variant="link" 
            className={`recipe-action-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => onLike(post.id)}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span className="action-count">{likeCount > 0 ? likeCount : ''}</span>
          </Button>
          
          <Button 
            variant="link" 
            className="recipe-action-btn"
            onClick={() => onComment(post.id)}
          >
            <FaComment />
            <span className="action-count">{commentsCount > 0 ? commentsCount : ''}</span>
          </Button>
          
          <Button 
            variant="link" 
            className={`recipe-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={() => onBookmark(post.id)}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </Button>
          
          <Button 
            variant="link" 
            className="recipe-action-btn"
            onClick={() => onShare(post.id)}
          >
            <FaShare />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;